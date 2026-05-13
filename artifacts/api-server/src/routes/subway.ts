import { Router } from "express";
import {
  SearchStationsQueryParams,
  GetRealtimeArrivalParams,
  FindRouteQueryParams,
  GetStationMapParams,
} from "@workspace/api-zod";
import {
  ALL_STATIONS,
  LINE_COLORS,
  LINE_NAMES,
  searchStations,
  findShortestPath,
  getStationsByName,
} from "./subway-data";

const router = Router();

const SUBWAY_API_KEY = process.env.SEOUL_SUBWAY_API_KEY || "";

// GET /subway/lines
router.get("/subway/lines", (_req, res) => {
  const lines = Object.entries(LINE_NAMES).map(([id, name]) => ({
    id,
    name,
    shortName: id,
    color: LINE_COLORS[id] || "#888888",
  }));
  res.json(lines);
});

// GET /subway/stations?q=&line=
router.get("/subway/stations", (req, res) => {
  const parsed = SearchStationsQueryParams.safeParse(req.query);
  const q = parsed.success ? parsed.data.q : (req.query.q as string | undefined);
  const line = parsed.success ? parsed.data.line : (req.query.line as string | undefined);

  const results = searchStations(q || "", line);
  res.json(results);
});

// GET /subway/arrival/:stationName
router.get("/subway/arrival/:stationName", async (req, res) => {
  const parsed = GetRealtimeArrivalParams.safeParse(req.params);
  const stationName = parsed.success ? parsed.data.stationName : req.params.stationName;

  if (!stationName) {
    res.status(400).json({ error: "역명이 필요합니다" });
    return;
  }

  try {
    const url = `http://swopenapi.seoul.go.kr/api/subway/${SUBWAY_API_KEY}/json/realtimeStationArrival/0/10/${encodeURIComponent(stationName)}`;
    const response = await fetch(url);

    if (!response.ok) {
      res.status(500).json({ error: "실시간 도착 정보를 가져올 수 없습니다" });
      return;
    }

    const data = await response.json() as any;

    if (!data.realtimeArrivalList) {
      res.json({
        stationName,
        arrivals: [],
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    const arrivals = (data.realtimeArrivalList as any[]).map((item: any) => {
      const lineNum = item.subwayId ? String(item.subwayId).slice(-1) : "?";
      const lineKey = item.subwayId ? lineNum : "?";
      return {
        trainNo: item.btrainNo || "",
        destination: item.bstatnNm || "",
        remainingTime: item.arvlMsg2 || item.arvlMsg3 || "",
        status: item.arvlCd || "0",
        line: `${lineNum}호선`,
        lineColor: LINE_COLORS[lineKey] || "#888888",
        currentStation: item.statnNm || stationName,
        direction: item.updnLine || "",
        isLastTrain: item.btrainSttus === "급행" ? false : item.lstcarAt === "1",
      };
    });

    res.json({
      stationName,
      arrivals,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "실시간 도착 API 오류");
    res.status(500).json({ error: "서버 오류가 발생했습니다" });
  }
});

// GET /subway/route?from=&to=
router.get("/subway/route", (req, res) => {
  const parsed = FindRouteQueryParams.safeParse(req.query);
  const from = parsed.success ? parsed.data.from : (req.query.from as string | undefined);
  const to = parsed.success ? parsed.data.to : (req.query.to as string | undefined);

  if (!from || !to) {
    res.status(400).json({ error: "출발역과 도착역이 필요합니다" });
    return;
  }

  const fromStations = getStationsByName(from);
  const toStations = getStationsByName(to);

  if (fromStations.length === 0) {
    res.status(404).json({ error: `출발역 '${from}'을 찾을 수 없습니다` });
    return;
  }
  if (toStations.length === 0) {
    res.status(404).json({ error: `도착역 '${to}'을 찾을 수 없습니다` });
    return;
  }

  const result = findShortestPath(from, to);
  if (!result) {
    res.status(404).json({ error: "경로를 찾을 수 없습니다" });
    return;
  }

  // Parse the path into segments by line
  const segments: {
    stations: string[];
    line: string;
    lineColor: string;
    lineNumber: string;
    boardingInfo: string;
  }[] = [];

  let currentLine = "";
  let currentStations: string[] = [];

  for (const node of result.path) {
    const [stationName, lineNum] = node.split("::");
    if (currentLine === "") {
      currentLine = lineNum;
      currentStations.push(stationName);
    } else if (lineNum === currentLine) {
      currentStations.push(stationName);
    } else {
      // Line change
      const lineKey = currentLine;
      segments.push({
        stations: currentStations,
        line: LINE_NAMES[lineKey] || `${currentLine}호선`,
        lineColor: LINE_COLORS[lineKey] || "#888888",
        lineNumber: currentLine,
        boardingInfo: `${currentStations[0]}역에서 ${LINE_NAMES[lineKey] || currentLine + "호선"} 탑승`,
      });
      currentLine = lineNum;
      currentStations = [stationName];
    }
  }

  if (currentStations.length > 0) {
    const lineKey = currentLine;
    segments.push({
      stations: currentStations,
      line: LINE_NAMES[lineKey] || `${currentLine}호선`,
      lineColor: LINE_COLORS[lineKey] || "#888888",
      lineNumber: currentLine,
      boardingInfo: segments.length > 0
        ? `${currentStations[0]}역에서 ${LINE_NAMES[lineKey] || currentLine + "호선"}으로 환승`
        : `${currentStations[0]}역에서 ${LINE_NAMES[lineKey] || currentLine + "호선"} 탑승`,
    });
  }

  const totalStations = result.path.length - 1;
  const transferCount = segments.length - 1;
  const estimatedTime = Math.round(totalStations * 2 + transferCount * 5);

  res.json({
    from,
    to,
    segments,
    totalStations,
    transferCount,
    estimatedTime,
  });
});

// GET /subway/station-map/:stationName
router.get("/subway/station-map/:stationName", (req, res) => {
  const parsed = GetStationMapParams.safeParse(req.params);
  const stationName = parsed.success ? parsed.data.stationName : req.params.stationName;

  // Return static facility info for now - real indoor map data requires a separate dataset
  const stationInfo = getStationsByName(stationName);
  if (stationInfo.length === 0) {
    res.status(404).json({ error: "역을 찾을 수 없습니다" });
    return;
  }

  const isTransfer = stationInfo.length > 1;
  const transferInfo = isTransfer
    ? `${stationInfo.map(s => s.line).join(", ")} 환승역`
    : null;

  res.json({
    stationName,
    floors: ["지하 2층", "지하 1층", "지상"],
    exits: [
      { number: "1번", description: "지하철 출구 1번 방향" },
      { number: "2번", description: "지하철 출구 2번 방향" },
      { number: "3번", description: "지하철 출구 3번 방향" },
      { number: "4번", description: "지하철 출구 4번 방향" },
    ],
    facilities: [
      { type: "화장실", location: "지하 1층", description: "승강장 연결통로 인근" },
      { type: "엘리베이터", location: "각 층", description: "교통약자 이동 지원" },
      { type: "에스컬레이터", location: "지하 1층 ↔ 지하 2층", description: "상행/하행" },
      { type: "물품보관함", location: "지하 1층 개찰구 인근", description: "코인 물품보관함 운영" },
      { type: "편의점", location: "지하 1층 개찰구 밖", description: "24시간 운영" },
      ...(isTransfer ? [{ type: "환승통로", location: "지하 1층-2층", description: "노선간 이동 통로" }] : []),
    ],
    transferInfo,
  });
});

export default router;
