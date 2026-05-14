import React, { useState, useRef } from "react";
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

interface Station {
  id: string;
  name: string;
  line: string;
  lineNumber: string;
  lineColor: string;
  transferLines?: string[];
}

interface Props {
  onLineSelect?: (lineId: string | null) => void;
  onStationSelect?: (station: string) => void;
}

export default function ControlPanel({ onLineSelect, onStationSelect }: Props) {
  return (
    <div className="h-full flex flex-col px-3 pt-2 pb-2 text-[20px]">
      <Tabs defaultValue="route" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-2 flex-shrink-0 h-10">
          <TabsTrigger value="line" className="text-sm font-semibold" data-testid="tab-line">노선 선택</TabsTrigger>
          <TabsTrigger value="route" className="text-sm font-semibold" data-testid="tab-route">경로 탐색</TabsTrigger>
          <TabsTrigger value="arrival" className="text-sm font-semibold" data-testid="tab-arrival">실시간 도착</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-hidden relative min-h-0">
          <TabsContent value="line" className="absolute inset-0 m-0 overflow-auto">
            <LineSearch onLineSelect={onLineSelect} />
          </TabsContent>
          <TabsContent value="route" className="absolute inset-0 m-0 overflow-hidden">
            <RouteSearch onStationSelect={onStationSelect} />
          </TabsContent>
          <TabsContent value="arrival" className="absolute inset-0 m-0 overflow-hidden">
            <ArrivalSearch onLineSelect={onLineSelect} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function LineSearch({ onLineSelect }: { onLineSelect?: (lineId: string | null) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [stationQuery, setStationQuery] = useState("");
  const debouncedQ = useDebounce(stationQuery, 250);

  const { data: stations } = useSearchStations(
    { q: debouncedQ, line: selected || undefined },
    {
      query: {
        enabled: debouncedQ.length > 0,
        queryKey: getSearchStationsQueryKey({ q: debouncedQ, line: selected || undefined }),
      },
    }
  );

  const handleLineSelect = (lineId: string) => {
    const next = selected === lineId ? null : lineId;
    setSelected(next);
    onLineSelect?.(next);
    setStationQuery("");
  };

  const handleClearLine = () => {
    setSelected(null);
    onLineSelect?.(null);
    setStationQuery("");
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Line buttons */}
      <div className="flex flex-wrap gap-1.5 flex-shrink-0">
        {Object.keys(LINE_NAMES).map(lineId => (
          <button
            key={lineId}
            onClick={() => handleLineSelect(lineId)}
            className="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
            style={{
              backgroundColor: selected === lineId ? LINE_COLORS[lineId] : "transparent",
              color: selected === lineId ? "#fff" : LINE_COLORS[lineId],
              borderColor: LINE_COLORS[lineId],
            }}
          >
            {LINE_NAMES[lineId]}
          </button>
        ))}
        {selected && (
          <button
            onClick={handleClearLine}
            className="px-3 py-1 rounded-full text-xs font-bold border-2 border-gray-300 text-gray-500 hover:bg-gray-100"
          >
            전체보기
          </button>
        )}
      </div>
      {/* Station search */}
      <div className="relative flex-shrink-0">
        <Input
          placeholder={selected ? `${LINE_NAMES[selected]} 역 검색...` : "역 이름 검색..."}
          value={stationQuery}
          onChange={e => setStationQuery(e.target.value)}
          className="h-11 text-base"
        />
        {stations && stations.length > 0 && stationQuery.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-popover border rounded-lg shadow-xl z-50 max-h-44 overflow-y-auto">
            {stations.slice(0, 15).map(st => (
              <div
                key={st.id}
                className="px-4 py-2.5 hover:bg-accent cursor-pointer flex items-center gap-3 text-sm"
                onClick={() => { setStationQuery(st.name); onStationSelect?.(st.name); }}
              >
                <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: st.lineColor }} />
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

function RouteSearch({ onStationSelect }: { onStationSelect?: (station: string) => void }) {
  const [from, setFrom] = useState<Station | null>(null);
  const [to, setTo] = useState<Station | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { data: routeResult, isLoading } = useFindRoute(
    { from: from?.name || "", to: to?.name || "" },
    {
      query: {
        enabled: searched && !!from && !!to,
        queryKey: getFindRouteQueryKey({ from: from?.name || "", to: to?.name || "" }),
      },
    }
  );

  const handleSearch = () => {
    if (from && to) setSearched(true);
  };

  const handleVoiceGuide = () => {
    if (!routeResult) return;
    if (!window.speechSynthesis) {
      alert("이 브라우저는 음성 안내를 지원하지 않습니다.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = routeResult.segments
      .map(seg => seg.boardingInfo)
      .join(". ");
    const fullText = `${from?.name}에서 ${to?.name}까지 경로 안내입니다. ${text}. 목적지 ${to?.name}에 도착합니다.`;
    const utt = new SpeechSynthesisUtterance(fullText);
    utt.lang = "ko-KR";
    utt.rate = 0.9;
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    speechRef.current = utt;
    window.speechSynthesis.speak(utt);
    setIsSpeaking(true);
  };

  const swapStations = () => {
    setFrom(to);
    setTo(from);
    setSearched(false);
  };

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Input row */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="flex-1">
          <StationSearchInput
            placeholder="출발역"
            value={from?.name || ""}
            onSelect={(st) => { setFrom(st); setSearched(false); }}
          />
        </div>
        <button
          onClick={swapStations}
          className="flex-shrink-0 w-8 h-11 flex items-center justify-center text-gray-400 hover:text-gray-700 text-xl"
          title="출발/도착 바꾸기"
        >⇄</button>
        <div className="flex-1">
          <StationSearchInput
            placeholder="도착역"
            value={to?.name || ""}
            onSelect={(st) => { setTo(st); setSearched(false); }}
          />
        </div>
        <Button
          data-testid="button-search-route"
          onClick={handleSearch}
          disabled={!from || !to}
          size="default"
          className="flex-shrink-0 h-11 px-4 text-sm font-semibold"
        >
          찾기
        </Button>
      </div>

      {/* Result */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading && (
          <div className="text-sm text-muted-foreground p-2 text-center">경로 탐색 중...</div>
        )}
        {routeResult && !isLoading && (
          <div className="h-full flex flex-col gap-1.5">
            {/* Summary + voice button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                총 <strong className="text-foreground">{routeResult.totalStations}개</strong> 역 ·
                환승 <strong className="text-foreground">{routeResult.transferCount}회</strong> ·
                약 <strong className="text-foreground">{routeResult.estimatedTime}분</strong>
              </span>
              <Button
                variant={isSpeaking ? "destructive" : "outline"}
                size="sm"
                className="ml-auto h-7 px-3 text-xs"
                onClick={handleVoiceGuide}
                data-testid="button-voice-guide"
              >
                {isSpeaking ? "🔊 중지" : "🔊 음성 안내"}
              </Button>
            </div>

            {/* Horizontal route line */}
            <ScrollArea className="flex-1 w-full min-h-0">
              <div className="flex items-start pb-3 pt-1 pl-2" style={{ minWidth: "max-content" }}>
                {routeResult.segments.map((seg, segIdx) => (
                  <React.Fragment key={segIdx}>
                    {seg.stations.map((stationName: string, stIdx: number) => {
                      const isFirst = segIdx === 0 && stIdx === 0;
                      const isLast = segIdx === routeResult.segments.length - 1 && stIdx === seg.stations.length - 1;
                      const isTransfer = stIdx === 0 && segIdx > 0;
                      const showConnector = !(stIdx === seg.stations.length - 1 && segIdx === routeResult.segments.length - 1);

                      return (
                        <React.Fragment key={`${segIdx}-${stIdx}`}>
                          <div className="flex flex-col items-center" style={{ minWidth: "56px" }}>
                            <div className="relative flex items-center justify-center" style={{ height: "28px" }}>
                              {(isTransfer || isFirst || isLast) ? (
                                <div
                                  className="rounded-full z-10"
                                  style={{
                                    width: "20px", height: "20px",
                                    backgroundColor: "#fff",
                                    border: `4px solid ${seg.lineColor}`,
                                    boxShadow: isTransfer ? `0 0 0 2px #fff, 0 0 0 4px ${seg.lineColor}` : "none",
                                  }}
                                />
                              ) : (
                                <div
                                  className="rounded-full z-10"
                                  style={{ width: "10px", height: "10px", backgroundColor: seg.lineColor }}
                                />
                              )}
                            </div>
                            <span
                              className="text-center whitespace-nowrap leading-tight mt-0.5"
                              style={{
                                fontSize: (isFirst || isLast || isTransfer) ? "11px" : "9px",
                                fontWeight: (isFirst || isLast || isTransfer) ? "700" : "400",
                                color: (isFirst || isLast || isTransfer) ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                                maxWidth: "56px", overflow: "hidden", textOverflow: "ellipsis",
                              }}
                            >{stationName}</span>
                          </div>
                          {showConnector && stIdx < seg.stations.length - 1 && (
                            <div style={{ height: "4px", width: "24px", backgroundColor: seg.lineColor, marginTop: "12px", flexShrink: 0 }} />
                          )}
                          {stIdx === seg.stations.length - 1 && segIdx < routeResult.segments.length - 1 && (
                            <div style={{ height: "4px", width: "16px", backgroundColor: routeResult.segments[segIdx + 1].lineColor, marginTop: "12px", flexShrink: 0, opacity: 0.5 }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Boarding instructions */}
            <div className="flex-shrink-0 space-y-0.5">
              {routeResult.segments.map((seg: any, i: number) => (
                <div key={i} className="text-xs flex items-center gap-2 px-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.lineColor }} />
                  <span className="text-muted-foreground">{seg.boardingInfo}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && !routeResult && searched && (
          <div className="text-sm text-destructive p-2 text-center">경로를 찾을 수 없습니다</div>
        )}
        {!searched && (
          <div className="text-sm text-muted-foreground text-center py-3">출발역과 도착역을 입력하고 경로를 찾으세요</div>
        )}
      </div>
    </div>
  );
}

function ArrivalSearch({ onLineSelect }: { onLineSelect?: (lineId: string | null) => void }) {
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [station, setStation] = useState<Station | null>(null);

  const { data: arrivals, isLoading, refetch } = useGetRealtimeArrival(
    station?.name || "",
    {
      query: {
        enabled: !!station,
        queryKey: getGetRealtimeArrivalQueryKey(station?.name || ""),
        refetchInterval: 30000,
      },
    }
  );

  const handleLineSelect = (lineId: string) => {
    const next = selectedLine === lineId ? null : lineId;
    setSelectedLine(next);
    onLineSelect?.(next);
    setStation(null);
  };

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      {/* Step 1: Line buttons */}
      <div className="flex-shrink-0">
        <p className="text-xs text-muted-foreground mb-1.5 font-medium">① 노선 선택</p>
        <div className="flex flex-wrap gap-1">
          {Object.keys(LINE_NAMES).map(lineId => (
            <button
              key={lineId}
              onClick={() => handleLineSelect(lineId)}
              className="px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all"
              style={{
                backgroundColor: selectedLine === lineId ? LINE_COLORS[lineId] : "transparent",
                color: selectedLine === lineId ? "#fff" : LINE_COLORS[lineId],
                borderColor: LINE_COLORS[lineId],
              }}
            >
              {LINE_NAMES[lineId]}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Station search */}
      {selectedLine && (
        <div className="flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">② 역 선택</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <StationSearchInput
                placeholder={`${LINE_NAMES[selectedLine]} 역 검색...`}
                value={station?.name || ""}
                lineFilter={selectedLine}
                onSelect={(st) => setStation(st)}
              />
            </div>
            {station && (
              <Button variant="outline" size="default" className="h-11 flex-shrink-0" onClick={() => refetch()}>
                새로고침
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Arrival board */}
      {station && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5 flex-shrink-0">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: selectedLine ? LINE_COLORS[selectedLine] : "#888" }}
            >
              {station.name}역
            </span>
            <span className="text-xs text-muted-foreground">실시간 도착 정보</span>
          </div>
          <ScrollArea className="h-full">
            {isLoading && <div className="text-sm text-muted-foreground text-center py-3">도착 정보 불러오는 중...</div>}
            {arrivals && arrivals.arrivals.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">현재 도착 예정 열차가 없습니다</div>
            )}
            {arrivals && arrivals.arrivals.map((arr: any, i: number) => (
              <div
                key={i}
                className="p-2.5 border rounded-lg mb-1.5 bg-card flex items-center gap-3"
                data-testid={`arrival-item-${i}`}
              >
                {/* Train icon */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <span className="text-2xl">🚇</span>
                  <span
                    className="text-white text-xs font-bold px-1.5 py-0.5 rounded-full mt-0.5"
                    style={{ backgroundColor: arr.lineColor || LINE_COLORS[arr.line?.replace("호선", "")] || "#888" }}
                  >
                    {arr.line}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{arr.destination}행</div>
                  <div className="text-xs text-muted-foreground truncate">{arr.direction} · {arr.currentStation}출발</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-primary">{arr.remainingTime}</div>
                  {arr.isLastTrain && <div className="text-xs text-destructive font-semibold">막차</div>}
                </div>
              </div>
            ))}
            {arrivals?.updatedAt && (
              <div className="text-xs text-muted-foreground text-right pt-1 pb-2">
                업데이트: {new Date(arrivals.updatedAt).toLocaleTimeString("ko-KR")}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {!selectedLine && (
        <div className="text-sm text-muted-foreground text-center py-4">노선을 선택하면 역별 실시간 도착 정보를 확인할 수 있습니다</div>
      )}
    </div>
  );
}

function StationSearchInput({
  placeholder,
  onSelect,
  value: initialValue = "",
  lineFilter,
}: {
  placeholder: string;
  onSelect: (st: Station) => void;
  value?: string;
  lineFilter?: string;
}) {
  const [query, setQuery] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 250);

  React.useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const { data: stations } = useSearchStations(
    { q: debouncedQuery, line: lineFilter },
    {
      query: {
        enabled: debouncedQuery.length > 0,
        queryKey: getSearchStationsQueryKey({ q: debouncedQuery, line: lineFilter }),
      },
    }
  );

  return (
    <div className="relative w-full">
      <Input
        data-testid={`input-search-${placeholder.replace(/\s/g, "-")}`}
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => debouncedQuery.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="h-11 text-base"
        autoComplete="off"
      />
      {open && stations && stations.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-popover border rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
          {stations.slice(0, 20).map((st) => (
            <div
              key={st.id}
              className="px-4 py-2.5 hover:bg-accent cursor-pointer flex items-center gap-3 text-sm"
              onMouseDown={() => {
                setQuery(st.name);
                onSelect(st);
                setOpen(false);
              }}
              data-testid={`option-station-${st.id}`}
            >
              <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: st.lineColor }} />
              <span className="font-semibold">{st.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{st.line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
