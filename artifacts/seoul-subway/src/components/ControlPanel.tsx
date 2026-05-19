import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useSearchStations,
  getSearchStationsQueryKey,
  useFindRoute,
  getFindRouteQueryKey,
  useGetRealtimeArrival,
  getGetRealtimeArrivalQueryKey,
} from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const LINE_COLORS: Record<string, string> = {
  "1": "#0052A4", "2": "#00A84D", "3": "#EF7C1C", "4": "#00A5DE",
  "5": "#996CAC", "6": "#CD7C2F", "7": "#747F00", "8": "#E6186C", "9": "#BDB092",
  "경의중앙": "#77C4A3", "공항": "#4EA4D4", "수인분당": "#F5A200",
  "신분당": "#D31145", "경춘": "#0C8E72", "우이신설": "#B0CE18",
  "신림": "#6789CA", "김포골드": "#9DC15D", "GTX-A": "#005EB8",
};

const LINE_NAMES: Record<string, string> = {
  "1": "1호선", "2": "2호선", "3": "3호선", "4": "4호선", "5": "5호선",
  "6": "6호선", "7": "7호선", "8": "8호선", "9": "9호선",
  "경의중앙": "경의중앙선", "공항": "공항철도", "수인분당": "수인분당선",
  "신분당": "신분당선", "경춘": "경춘선", "우이신설": "우이신설선",
  "신림": "신림선", "김포골드": "김포골드라인", "GTX-A": "GTX-A",
};

// Time slot helper for congestion
const TIME_SLOTS = [
  "05:30","06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30",
  "10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00",
  "14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30",
  "19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00",
  "23:30","00:00","00:30",
];

function getCurrentTimeSlot(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMin = h * 60 + m;
  // Find closest 30-min slot
  let best = TIME_SLOTS[0];
  let bestDiff = 9999;
  for (const slot of TIME_SLOTS) {
    const [sh, sm] = slot.split(":").map(Number);
    const slotMin = (sh === 0 || sh === 1) ? (sh + 24) * 60 + sm : sh * 60 + sm; // treat 00: as +24h
    const diff = Math.abs(totalMin - slotMin);
    if (diff < bestDiff) { bestDiff = diff; best = slot; }
  }
  return best;
}

function getDayType(): string {
  const d = new Date().getDay();
  if (d === 0) return "일요일";
  if (d === 6) return "토요일";
  return "평일";
}

function congestionLevel(v: number): { label: string; color: string; bg: string; pct: number } {
  if (v < 30) return { label: "매우 여유", color: "#22c55e", bg: "#dcfce7", pct: Math.round((v / 30) * 25) };
  if (v < 60) return { label: "여유", color: "#84cc16", bg: "#f0fdf4", pct: Math.round(25 + ((v-30)/30)*25) };
  if (v < 80) return { label: "보통", color: "#f59e0b", bg: "#fef3c7", pct: Math.round(50 + ((v-60)/20)*20) };
  if (v < 100) return { label: "혼잡", color: "#f97316", bg: "#fff7ed", pct: Math.round(70 + ((v-80)/20)*20) };
  return { label: "매우 혼잡", color: "#ef4444", bg: "#fef2f2", pct: Math.min(100, Math.round(90 + ((v-100)/50)*10)) };
}

interface Station { id: string; name: string; line: string; lineNumber: string; lineColor: string; }
interface Props {
  onLineSelect?: (lineId: string | null) => void;
  onStationSelect?: (station: string) => void;
  onStationHighlight?: (name: string, lineNumber: string) => void;
}

export default function ControlPanel({ onLineSelect, onStationSelect, onStationHighlight }: Props) {
  return (
    <div className="h-full flex flex-col px-3 pt-2 pb-2">
      <Tabs defaultValue="route" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-2 flex-shrink-0 h-10">
          <TabsTrigger value="line" className="text-sm font-semibold">노선 선택</TabsTrigger>
          <TabsTrigger value="route" className="text-sm font-semibold">경로 탐색</TabsTrigger>
          <TabsTrigger value="arrival" className="text-sm font-semibold">실시간 도착</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-hidden relative min-h-0">
          <TabsContent value="line" className="absolute inset-0 m-0 overflow-auto">
            <LineTab onLineSelect={onLineSelect} onStationHighlight={onStationHighlight} />
          </TabsContent>
          <TabsContent value="route" className="absolute inset-0 m-0 overflow-hidden">
            <RouteTab />
          </TabsContent>
          <TabsContent value="arrival" className="absolute inset-0 m-0 overflow-hidden">
            <ArrivalTab onLineSelect={onLineSelect} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 1. 노선 선택 Tab
// ─────────────────────────────────────────────────────────────────
function LineTab({
  onLineSelect,
  onStationHighlight,
}: {
  onLineSelect?: (l: string | null) => void;
  onStationHighlight?: (name: string, lineNumber: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 250);

  const { data: stations } = useSearchStations(
    { q: dq, line: selected || undefined },
    { query: { enabled: dq.length > 0, queryKey: getSearchStationsQueryKey({ q: dq, line: selected || undefined }) } }
  );

  const pick = (id: string) => {
    const next = selected === id ? null : id;
    setSelected(next); onLineSelect?.(next); setQ("");
  };

  const selectStation = (st: { name: string; lineNumber: string }) => {
    setQ("");
    onStationHighlight?.(st.name, st.lineNumber);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(LINE_NAMES).map(id => (
          <button key={id} onClick={() => pick(id)}
            className="px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all"
            style={{
              backgroundColor: selected === id ? LINE_COLORS[id] : "transparent",
              color: selected === id ? "#fff" : LINE_COLORS[id],
              borderColor: LINE_COLORS[id],
            }}>{LINE_NAMES[id]}</button>
        ))}
        {selected && (
          <button onClick={() => { setSelected(null); onLineSelect?.(null); }}
            className="px-2.5 py-1 rounded-full text-xs font-bold border-2 border-gray-300 text-gray-500 hover:bg-gray-100">전체</button>
        )}
      </div>
      <div className="relative">
        <Input
          placeholder={selected ? `${LINE_NAMES[selected]} 역 검색...` : "역 이름 검색 후 선택하면 지도가 확대됩니다"}
          value={q}
          onChange={e => setQ(e.target.value)}
          className="h-11 text-base"
        />
        {stations && stations.length > 0 && q.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-popover border rounded-lg shadow-xl z-50 max-h-44 overflow-y-auto">
            {stations.slice(0, 15).map(st => (
              <div
                key={st.id}
                onClick={() => selectStation(st)}
                className="px-4 py-2.5 hover:bg-accent cursor-pointer flex items-center gap-3 text-sm"
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0 inline-block" style={{ backgroundColor: st.lineColor }} />
                <span className="font-medium">{st.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{st.line}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 2. 경로 탐색 Tab  (환승 상세 + 혼잡도)
// ─────────────────────────────────────────────────────────────────
function RouteTab() {
  const [from, setFrom] = useState<Station | null>(null);
  const [to, setTo] = useState<Station | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [congestionMap, setCongestionMap] = useState<Record<string, { label: string; color: string; bg: string; pct: number; value: number } | null>>({});

  const { data: routeResult, isLoading } = useFindRoute(
    { from: from?.name || "", to: to?.name || "" },
    { query: { enabled: searched && !!from && !!to, queryKey: getFindRouteQueryKey({ from: from?.name || "", to: to?.name || "" }) } }
  );

  // Fetch congestion for each segment when route result arrives
  useEffect(() => {
    if (!routeResult) return;
    const dayType = getDayType();
    const slot = getCurrentTimeSlot();
    const segs = routeResult.segments as any[];
    const newMap: Record<string, any> = {};

    Promise.all(
      segs.map(async (seg: any) => {
        const boardStation = seg.stations[0];
        try {
          const resp = await fetch(`/api/subway/congestion?line=${encodeURIComponent(seg.lineNumber)}&station=${encodeURIComponent(boardStation)}&dayType=${encodeURIComponent(dayType)}`);
          const data = await resp.json();
          if (data.congestion) {
            const dirs = data.congestion[dayType] || {};
            // Average 상선 + 하선 or pick either
            const vals: number[] = [];
            for (const dir of Object.values(dirs) as any[]) {
              const v = dir[slot];
              if (v != null) vals.push(v);
            }
            const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
            if (avg != null) {
              const lv = congestionLevel(avg);
              newMap[seg.stations[0]] = { ...lv, value: Math.round(avg) };
            } else {
              newMap[seg.stations[0]] = null;
            }
          } else {
            newMap[seg.stations[0]] = null;
          }
        } catch { newMap[seg.stations[0]] = null; }
      })
    ).then(() => setCongestionMap(newMap));
  }, [routeResult]);

  const handleVoice = () => {
    if (!routeResult) return;
    if (!window.speechSynthesis) { alert("이 브라우저는 음성 안내를 지원하지 않습니다."); return; }
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }

    const segs = routeResult.segments as any[];
    const parts = segs.map((seg: any, i: number) => {
      const xi = seg.transferInfo as any;
      if (i === 0) return `${seg.stations[0]}역에서 ${seg.line}을 탑승합니다.`;
      if (xi) return `${xi.fromStation}역에서 ${xi.alightCar}호차 ${xi.alightDoor}번 문으로 내리신 후, ${xi.toLine}으로 환승하여 ${xi.boardDirection} 방향 ${xi.boardCar}호차 ${xi.boardDoor}번 문에서 탑승하세요. 환승 소요시간 약 ${xi.time}.`;
      return `${seg.stations[0]}역에서 ${seg.line}으로 환승합니다.`;
    });
    const full = `${from?.name}에서 ${to?.name}까지. 총 ${routeResult.totalStations}개 역, 환승 ${routeResult.transferCount}회, 약 ${routeResult.estimatedTime}분 소요. ${parts.join(" ")} 목적지 ${to?.name}에 도착합니다.`;
    const utt = new SpeechSynthesisUtterance(full);
    utt.lang = "ko-KR"; utt.rate = 0.9;
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
    setIsSpeaking(true);
  };

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Input row */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="flex-1">
          <StationInput placeholder="출발역" value={from?.name || ""} onSelect={st => { setFrom(st); setSearched(false); }} />
        </div>
        <button onClick={() => { setFrom(to); setTo(from); setSearched(false); }}
          className="flex-shrink-0 w-8 h-11 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg" title="바꾸기">⇄</button>
        <div className="flex-1">
          <StationInput placeholder="도착역" value={to?.name || ""} onSelect={st => { setTo(st); setSearched(false); }} />
        </div>
        <Button onClick={() => { if (from && to) { setSearched(true); setCongestionMap({}); } }}
          disabled={!from || !to} size="default" className="flex-shrink-0 h-11 px-4 text-sm font-semibold">찾기</Button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading && <div className="text-sm text-muted-foreground text-center py-4">경로 탐색 중...</div>}

        {routeResult && !isLoading && (
          <div className="h-full flex flex-col gap-1.5 overflow-hidden">
            {/* Summary + voice */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                총 <strong className="text-foreground">{routeResult.totalStations}개</strong> 역 ·
                환승 <strong className="text-foreground">{routeResult.transferCount}회</strong> ·
                약 <strong className="text-foreground">{routeResult.estimatedTime}분</strong>
              </span>
              <Button variant={isSpeaking ? "destructive" : "outline"} size="sm"
                className="ml-auto h-7 px-3 text-xs" onClick={handleVoice}>
                {isSpeaking ? "🔊 중지" : "🔊 음성 안내"}
              </Button>
            </div>

            {/* Horizontal route visualization */}
            <ScrollArea className="flex-shrink-0 w-full">
              <div className="flex items-start pb-2 pt-1 pl-2" style={{ minWidth: "max-content" }}>
                {(routeResult.segments as any[]).map((seg: any, si: number) => (
                  <React.Fragment key={si}>
                    {(seg.stations as string[]).map((name: string, stIdx: number) => {
                      const isFirst = si === 0 && stIdx === 0;
                      const isLast = si === routeResult.segments.length - 1 && stIdx === seg.stations.length - 1;
                      const isTransfer = stIdx === 0 && si > 0;
                      const showLineAfter = !(stIdx === seg.stations.length - 1 && si === routeResult.segments.length - 1);
                      return (
                        <React.Fragment key={`${si}-${stIdx}`}>
                          <div className="flex flex-col items-center" style={{ minWidth: 52 }}>
                            <div className="relative flex items-center justify-center" style={{ height: 26 }}>
                              {(isTransfer || isFirst || isLast)
                                ? <div className="rounded-full z-10" style={{ width: 20, height: 20, backgroundColor: "#fff", border: `4px solid ${seg.lineColor}`, boxShadow: isTransfer ? `0 0 0 2px #fff,0 0 0 4px ${seg.lineColor}` : undefined }} />
                                : <div className="rounded-full z-10" style={{ width: 10, height: 10, backgroundColor: seg.lineColor }} />
                              }
                            </div>
                            <span className="text-center whitespace-nowrap leading-tight mt-0.5"
                              style={{ fontSize: (isFirst || isLast || isTransfer) ? 11 : 9, fontWeight: (isFirst || isLast || isTransfer) ? 700 : 400, color: (isFirst || isLast || isTransfer) ? "var(--color-foreground)" : "var(--color-muted-foreground)", maxWidth: 52, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {name}
                            </span>
                          </div>
                          {showLineAfter && stIdx < seg.stations.length - 1 && (
                            <div style={{ height: 4, width: 22, backgroundColor: seg.lineColor, marginTop: 11, flexShrink: 0 }} />
                          )}
                          {stIdx === seg.stations.length - 1 && si < routeResult.segments.length - 1 && (
                            <div style={{ height: 4, width: 14, backgroundColor: (routeResult.segments as any[])[si + 1].lineColor, marginTop: 11, flexShrink: 0, opacity: 0.5 }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Segment cards */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-2 pb-2">
                {(routeResult.segments as any[]).map((seg: any, i: number) => {
                  const xi = seg.transferInfo as any;
                  const cg = congestionMap[seg.stations[0]];
                  return (
                    <div key={i} className="rounded-lg border bg-card overflow-hidden">
                      {/* Boarding info row */}
                      <div className="flex items-center gap-2 px-3 py-2" style={{ borderLeft: `4px solid ${seg.lineColor}` }}>
                        <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.lineColor }} />
                        <span className="text-xs font-semibold flex-1">{seg.boardingInfo}</span>
                        <span className="text-xs text-muted-foreground">{seg.stations.length - 1}정거장</span>
                      </div>

                      {/* Congestion badge */}
                      {cg && (
                        <div className="px-3 pb-2 pt-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex-shrink-0">현재 혼잡도</span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${cg.pct}%`, backgroundColor: cg.color }} />
                            </div>
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: cg.color }}>{cg.label}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">({cg.value}%)</span>
                          </div>
                        </div>
                      )}

                      {/* Transfer detail */}
                      {i > 0 && xi && (
                        <div className="mx-3 mb-2 rounded-lg bg-muted/50 p-2 text-xs space-y-1">
                          <div className="font-semibold text-foreground/70 flex items-center gap-1.5">
                            <span>🔀</span>
                            <span>{xi.fromStation}역 환승 안내</span>
                            <span className="ml-auto font-normal text-muted-foreground">⏱ {xi.time}</span>
                          </div>
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground/60">하차</span>{" "}
                            {xi.fromLine}호선 · {xi.alightDirection} ·{" "}
                            <span className="text-blue-600 font-bold">{xi.alightCar}호차 {xi.alightDoor}번 문</span>
                          </div>
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground/60">탑승</span>{" "}
                            {xi.toLine} · {xi.boardDirection} ·{" "}
                            <span className="text-green-600 font-bold">{xi.boardCar}호차 {xi.boardDoor}번 문</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {!isLoading && !routeResult && searched && (
          <div className="text-sm text-destructive text-center py-4">경로를 찾을 수 없습니다</div>
        )}
        {!searched && (
          <div className="text-sm text-muted-foreground text-center py-4">출발역·도착역을 입력하고 경로를 찾으세요</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 3. 실시간 도착 Tab  (노선+역 종합 필터, 상행/하행, 시간순 정렬)
// ─────────────────────────────────────────────────────────────────
function ArrivalTab({ onLineSelect }: { onLineSelect?: (l: string | null) => void }) {
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [direction, setDirection] = useState<"all" | "상행" | "하행">("all");

  const { data: rawArrivals, isLoading, refetch } = useGetRealtimeArrival(
    station?.name || "",
    { query: { enabled: !!station, queryKey: getGetRealtimeArrivalQueryKey(station?.name || ""), refetchInterval: 30000 } }
  );

  // Filter arrivals: by selected line + direction, sorted by arrival time
  const arrivals = React.useMemo(() => {
    if (!rawArrivals?.arrivals) return [];
    let list = rawArrivals.arrivals as any[];

    // Filter by selected line
    if (selectedLine) {
      const targetLineName = LINE_NAMES[selectedLine] || "";
      list = list.filter(a =>
        a.lineKey === selectedLine ||
        a.line === targetLineName ||
        a.line?.includes(selectedLine)
      );
    }

    // Filter by direction
    if (direction !== "all") {
      list = list.filter(a => {
        const d = (a.updown || a.direction || "").trim();
        return d.includes(direction) || d === direction;
      });
    }

    // Already sorted by remainingSec from backend, but re-sort just in case
    return [...list].sort((a, b) => (a.remainingSec ?? 9999) - (b.remainingSec ?? 9999));
  }, [rawArrivals, selectedLine, direction]);

  const pickLine = (id: string) => {
    const next = selectedLine === id ? null : id;
    setSelectedLine(next);
    onLineSelect?.(next);
    setStation(null);
    setDirection("all");
  };

  const clearAll = () => {
    setSelectedLine(null);
    onLineSelect?.(null);
    setStation(null);
    setDirection("all");
  };

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      {/* Step 1: Line */}
      <div className="flex-shrink-0">
        <p className="text-xs text-muted-foreground mb-1 font-medium">① 노선</p>
        <div className="flex flex-wrap gap-1">
          {Object.keys(LINE_NAMES).map(id => (
            <button key={id} onClick={() => pickLine(id)}
              className="px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all"
              style={{
                backgroundColor: selectedLine === id ? LINE_COLORS[id] : "transparent",
                color: selectedLine === id ? "#fff" : LINE_COLORS[id],
                borderColor: LINE_COLORS[id],
              }}>{LINE_NAMES[id]}</button>
          ))}
          {selectedLine && (
            <button onClick={clearAll} className="px-2.5 py-1 rounded-full text-xs border-2 border-gray-200 text-gray-500 hover:bg-gray-100">초기화</button>
          )}
        </div>
      </div>

      {/* Step 2: Station search */}
      {selectedLine && (
        <div className="flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-1 font-medium">② 역</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <StationInput
                placeholder={`${LINE_NAMES[selectedLine]} 역 검색...`}
                value={station?.name || ""}
                lineFilter={selectedLine}
                onSelect={st => { setStation(st); setDirection("all"); }}
              />
            </div>
            {station && (
              <Button variant="outline" size="default" className="h-11 flex-shrink-0 px-3" onClick={() => refetch()}>
                ↺
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Direction filter — shown only when station is selected */}
      {station && (
        <div className="flex-shrink-0 flex items-center gap-2">
          <p className="text-xs text-muted-foreground font-medium">③ 방향</p>
          <div className="flex gap-1">
            {(["all", "상행", "하행"] as const).map(d => (
              <button key={d} onClick={() => setDirection(d)}
                className="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
                style={{
                  backgroundColor: direction === d ? (selectedLine ? LINE_COLORS[selectedLine] : "#555") : "transparent",
                  color: direction === d ? "#fff" : (selectedLine ? LINE_COLORS[selectedLine] : "#555"),
                  borderColor: selectedLine ? LINE_COLORS[selectedLine] : "#555",
                }}>
                {d === "all" ? "전체" : d}
              </button>
            ))}
          </div>
          {rawArrivals?.updatedAt && (
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(rawArrivals.updatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {station && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            {isLoading && <div className="text-sm text-muted-foreground text-center py-4">도착 정보 불러오는 중...</div>}

            {!isLoading && arrivals.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-5 space-y-1">
                <div>도착 예정 열차가 없습니다</div>
                {direction !== "all" && <div className="text-xs">방향 필터를 '전체'로 변경해 보세요</div>}
              </div>
            )}

            {arrivals.map((arr: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2.5 border rounded-lg mb-1.5 bg-card"
                style={{ borderLeft: `4px solid ${arr.lineColor || "#888"}` }}>
                {/* Rank badge */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate flex items-center gap-1.5">
                    <span>{arr.destination}행</span>
                    {arr.isExpress && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">급행</span>}
                    {arr.isLastTrain && <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">막차</span>}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="font-medium px-1.5 py-0.5 rounded text-white text-[10px]"
                      style={{ backgroundColor: arr.lineColor || "#888" }}>{arr.line}</span>
                    <span>{arr.updown || arr.direction}</span>
                    <span>·</span>
                    <span>{arr.currentStation} 출발</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-primary leading-tight">{arr.remainingTime}</div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      {!selectedLine && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground text-center">
            <div className="text-2xl mb-2">🚇</div>
            <div>노선을 선택하면</div>
            <div>실시간 도착 정보를 확인할 수 있습니다</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Shared: station search input with dropdown
// ─────────────────────────────────────────────────────────────────
function StationInput({
  placeholder, onSelect, value: externalValue = "", lineFilter,
}: {
  placeholder: string;
  onSelect: (st: Station) => void;
  value?: string;
  lineFilter?: string;
}) {
  const [q, setQ] = useState(externalValue);
  const [open, setOpen] = useState(false);
  const dq = useDebounce(q, 250);

  useEffect(() => { setQ(externalValue); }, [externalValue]);

  const { data: stations } = useSearchStations(
    { q: dq, line: lineFilter },
    { query: { enabled: dq.length > 0, queryKey: getSearchStationsQueryKey({ q: dq, line: lineFilter }) } }
  );

  return (
    <div className="relative w-full">
      <Input
        placeholder={placeholder} value={q} autoComplete="off"
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => dq.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        className="h-11 text-base"
      />
      {open && stations && stations.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-popover border rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto">
          {stations.slice(0, 20).map(st => (
            <div key={st.id}
              className="px-4 py-2.5 hover:bg-accent cursor-pointer flex items-center gap-3 text-sm"
              onMouseDown={() => { setQ(st.name); onSelect(st); setOpen(false); }}>
              <span className="w-3 h-3 rounded-full flex-shrink-0 inline-block" style={{ backgroundColor: st.lineColor }} />
              <span className="font-semibold">{st.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{st.line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
