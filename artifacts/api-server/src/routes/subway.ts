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
import toiletData from "./toilet-data.json";
import transferData from "./transfer-data.json";
import congestionData from "./congestion-data.json";
import stationInfoData from "./station-info-data.json";

const router = Router();

const SUBWAY_API_KEY = process.env.SEOUL_SUBWAY_API_KEY || "";

// Normalize line id from transfer data to our line key system
function normalizeTransferLine(line: string): string {
  const t = line.trim();
  // If it's just a digit, return it directly
  if (/^\d+$/.test(t)) return t;
  // "1호선" → "1"
  const m = t.match(/^(\d+)호선$/);
  if (m) return m[1];
  // Named lines
  const nameMap: Record<string, string> = {
    "공항철도": "공항", "경의중앙선": "경의중앙", "경의·중앙선": "경의중앙",
    "수인분당선": "수인분당", "신분당선": "신분당", "경춘선": "경춘",
    "우이신설선": "우이신설", "신림선": "신림", "김포골드라인": "김포골드",
    "GTX-A": "GTX-A",
  };
  return nameMap[t] || t;
}

// Find best transfer info from transfer-data.json
function findTransferInfo(
  xferStation: string,
  fromLineKey: string,
  toLineKey: string
): object | undefined {
  const td = transferData as any[];

  // Try exact match first
  let found = td.find(t => {
    const fl = normalizeTransferLine(t.fromLine);
    const tl = normalizeTransferLine(t.toLine);
    return t.fromStation === xferStation && fl === fromLineKey && tl === toLineKey;
  });
  if (found) return found;

  // Try fuzzy station name match
  found = td.find(t => {
    const fl = normalizeTransferLine(t.fromLine);
    const tl = normalizeTransferLine(t.toLine);
    return (
      (t.fromStation.includes(xferStation) || xferStation.includes(t.fromStation)) &&
      fl === fromLineKey && tl === toLineKey
    );
  });
  if (found) return found;

  // Fall back to line-only match at any station with same name
  found = td.find(t => {
    const fl = normalizeTransferLine(t.fromLine);
    const tl = normalizeTransferLine(t.toLine);
    return fl === fromLineKey && tl === toLineKey;
  });
  return found;
}

// GET /subway/lines
router.get("/subway/lines", (_req, res) => {
  const lines = Object.entries(LINE_NAMES).map(([id, name]) => ({
    id, name, shortName: id, color: LINE_COLORS[id] || "#888888",
  }));
  res.json(lines);
});

// GET /subway/stations?q=&line=
router.get("/subway/stations", (req, res) => {
  const parsed = SearchStationsQueryParams.safeParse(req.query);
  const q = parsed.success ? parsed.data.q : (req.query.q as string | undefined);
  const line = parsed.success ? parsed.data.line : (req.query.line as string | undefined);
  res.json(searchStations(q || "", line));
});

// GET /subway/arrival/:stationName
router.get("/subway/arrival/:stationName", async (req, res) => {
  const parsed = GetRealtimeArrivalParams.safeParse(req.params);
  const stationName = parsed.success ? parsed.data.stationName : req.params.stationName;

  if (!stationName) { res.status(400).json({ error: "역명이 필요합니다" }); return; }

  try {
    const url = `http://swopenapi.seoul.go.kr/api/subway/${SUBWAY_API_KEY}/json/realtimeStationArrival/0/40/${encodeURIComponent(stationName)}`;
    const response = await fetch(url);

    if (!response.ok) { res.status(500).json({ error: "실시간 도착 정보를 가져올 수 없습니다" }); return; }

    const data = await response.json() as any;

    if (!data.realtimeArrivalList) {
      res.json({ stationName, arrivals: [], updatedAt: new Date().toISOString() });
      return;
    }

    const idMap: Record<string, string> = {
      "1001":"1","1002":"2","1003":"3","1004":"4","1005":"5",
      "1006":"6","1007":"7","1008":"8","1009":"9",
      "1063":"경의중앙","1065":"공항","1067":"신분당",
      "1075":"수인분당","1077":"경춘","1092":"우이신설",
      "1093":"신림","1081":"GTX-A",
    };

    const arrivals = (data.realtimeArrivalList as any[]).map((item: any) => {
      const subwayIdStr = String(item.subwayId || "");
      const lineKey = idMap[subwayIdStr] || subwayIdStr.slice(-1);
      // Parse remaining seconds from arvlMsg2 or arvlMsg3 for sorting
      let remainingSec = 9999;
      const msg = item.arvlMsg2 || item.arvlMsg3 || "";
      const secMatch = msg.match(/(\d+)분\s*(\d+)?초?/) || msg.match(/(\d+)초/);
      if (secMatch) {
        remainingSec = secMatch[2]
          ? parseInt(secMatch[1]) * 60 + parseInt(secMatch[2])
          : parseInt(secMatch[1]);
      } else if (msg.includes("전역 출발")) remainingSec = 120;
      else if (msg.includes("당역 도착") || msg.includes("진입")) remainingSec = 10;
      else if (msg.includes("운행 중")) remainingSec = 300;

      return {
        trainNo: item.btrainNo || "",
        destination: item.bstatnNm || "",
        remainingTime: msg,
        remainingSec,
        status: item.arvlCd || "0",
        lineKey,
        line: LINE_NAMES[lineKey] || `${lineKey}호선`,
        lineColor: LINE_COLORS[lineKey] || "#888888",
        currentStation: item.statnNm || stationName,
        direction: item.updnLine || "",
        updown: item.updnLine?.includes("상") ? "상행" : item.updnLine?.includes("하") ? "하행" : item.updnLine || "",
        isLastTrain: item.lstcarAt === "1",
        isExpress: item.btrainSttus === "급행",
      };
    }).sort((a: any, b: any) => a.remainingSec - b.remainingSec);

    res.json({ stationName, arrivals, updatedAt: new Date().toISOString() });
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

  if (!from || !to) { res.status(400).json({ error: "출발역과 도착역이 필요합니다" }); return; }
  if (getStationsByName(from).length === 0) { res.status(404).json({ error: `출발역 '${from}'을 찾을 수 없습니다` }); return; }
  if (getStationsByName(to).length === 0) { res.status(404).json({ error: `도착역 '${to}'을 찾을 수 없습니다` }); return; }

  const result = findShortestPath(from, to);
  if (!result) { res.status(404).json({ error: "경로를 찾을 수 없습니다" }); return; }

  const segments: {
    stations: string[];
    line: string;
    lineColor: string;
    lineNumber: string;
    boardingInfo: string;
    transferInfo?: object;
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
      const lineKey = currentLine;
      const xferStation = currentStations[currentStations.length - 1];
      const xferInfo = findTransferInfo(xferStation, lineKey, lineNum);
      segments.push({
        stations: currentStations,
        line: LINE_NAMES[lineKey] || `${currentLine}호선`,
        lineColor: LINE_COLORS[lineKey] || "#888888",
        lineNumber: currentLine,
        boardingInfo: `${currentStations[0]}역에서 ${LINE_NAMES[lineKey] || currentLine + "호선"} 탑승`,
        transferInfo: xferInfo,
      });
      currentLine = lineNum;
      currentStations = [stationName];
    }
  }

  if (currentStations.length > 0) {
    const lineKey = currentLine;
    const prevSegment = segments[segments.length - 1];
    const xferInfo = prevSegment
      ? findTransferInfo(currentStations[0], prevSegment.lineNumber, lineKey)
      : undefined;
    segments.push({
      stations: currentStations,
      line: LINE_NAMES[lineKey] || `${currentLine}호선`,
      lineColor: LINE_COLORS[lineKey] || "#888888",
      lineNumber: currentLine,
      boardingInfo: segments.length > 0
        ? `${currentStations[0]}역에서 ${LINE_NAMES[lineKey] || currentLine + "호선"}으로 환승`
        : `${currentStations[0]}역에서 ${LINE_NAMES[lineKey] || currentLine + "호선"} 탑승`,
      transferInfo: xferInfo,
    });
  }

  const totalStations = result.path.length - 1;
  const transferCount = segments.length - 1;
  const estimatedTime = Math.round(totalStations * 2 + transferCount * 5);
  res.json({ from, to, segments, totalStations, transferCount, estimatedTime });
});

// GET /subway/transfer-info?station=&fromLine=&toLine=
router.get("/subway/transfer-info", (req, res) => {
  const { station, fromLine, toLine } = req.query as Record<string, string>;
  let results = transferData as any[];
  if (station) results = results.filter(t => t.fromStation === station || t.toStation === station);
  if (fromLine) results = results.filter(t => normalizeTransferLine(t.fromLine) === normalizeTransferLine(fromLine));
  if (toLine) results = results.filter(t => normalizeTransferLine(t.toLine) === normalizeTransferLine(toLine));
  res.json(results.slice(0, 50));
});

// GET /subway/congestion?line=&station=&dayType=
router.get("/subway/congestion", (req, res) => {
  const { line, station, dayType } = req.query as Record<string, string>;
  if (!line || !station) {
    res.status(400).json({ error: "line과 station 파라미터가 필요합니다" });
    return;
  }
  const cg = congestionData as Record<string, Record<string, any>>;
  const lineData = cg[line] || cg[line + "호선"] || {};
  const stationData = lineData[station];
  if (!stationData) {
    // Try fuzzy match
    const fuzzyKey = Object.keys(lineData).find(k => k.includes(station) || station.includes(k));
    if (fuzzyKey) {
      res.json({ line, station, congestion: lineData[fuzzyKey], dayType: dayType || "평일" });
    } else {
      res.json({ line, station, congestion: null, dayType: dayType || "평일" });
    }
    return;
  }
  res.json({ line, station, congestion: stationData, dayType: dayType || "평일" });
});

// GET /subway/toilets?lat=&lng=&radius=
router.get("/subway/toilets", (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radius = parseFloat(req.query.radius as string) || 1000;
  let results = toiletData as any[];
  if (!isNaN(lat) && !isNaN(lng)) {
    results = results.filter(t => {
      const dlat = (t.lat - lat) * 111320;
      const dlng = (t.lng - lng) * 111320 * Math.cos(lat * Math.PI / 180);
      return Math.sqrt(dlat * dlat + dlng * dlng) <= radius;
    }).map(t => {
      const dlat = (t.lat - lat) * 111320;
      const dlng = (t.lng - lng) * 111320 * Math.cos(lat * Math.PI / 180);
      return { ...t, distance: Math.round(Math.sqrt(dlat * dlat + dlng * dlng)) };
    }).sort((a, b) => a.distance - b.distance);
  } else {
    results = results.slice(0, 200);
  }
  res.json(results.slice(0, 300));
});

// GET /subway/station-map/:stationName
router.get("/subway/station-map/:stationName", (req, res) => {
  const parsed = GetStationMapParams.safeParse(req.params);
  const stationName = parsed.success ? parsed.data.stationName : req.params.stationName;
  const stationInfo = getStationsByName(stationName);
  if (stationInfo.length === 0) { res.status(404).json({ error: "역을 찾을 수 없습니다" }); return; }
  const isTransfer = stationInfo.length > 1;
  res.json({
    stationName,
    floors: ["지하 2층", "지하 1층", "지상"],
    exits: [{ number: "1번", description: "지하철 출구 1번 방향" }, { number: "2번", description: "지하철 출구 2번 방향" }],
    facilities: [
      { type: "화장실", location: "지하 1층", description: "승강장 연결통로 인근" },
      { type: "엘리베이터", location: "각 층", description: "교통약자 이동 지원" },
      ...(isTransfer ? [{ type: "환승통로", location: "지하 1층-2층", description: "노선간 이동 통로" }] : []),
    ],
    transferInfo: isTransfer ? `${stationInfo.map(s => s.line).join(", ")} 환승역` : null,
  });
});

export default router;
