import React, { useState } from "react";
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
    <div className="h-full flex flex-col px-4 pt-2 pb-3">
      <Tabs defaultValue="route" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-2 flex-shrink-0">
          <TabsTrigger value="line" data-testid="tab-line">노선 선택</TabsTrigger>
          <TabsTrigger value="route" data-testid="tab-route">경로 탐색</TabsTrigger>
          <TabsTrigger value="arrival" data-testid="tab-arrival">실시간 도착</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-hidden relative min-h-0">
          <TabsContent value="line" className="absolute inset-0 m-0 overflow-auto">
            <LineSearch onLineSelect={onLineSelect} />
          </TabsContent>
          <TabsContent value="route" className="absolute inset-0 m-0 overflow-hidden">
            <RouteSearch onStationSelect={onStationSelect} />
          </TabsContent>
          <TabsContent value="arrival" className="absolute inset-0 m-0 overflow-auto">
            <ArrivalSearch />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function LineSearch({ onLineSelect }: { onLineSelect?: (lineId: string | null) => void }) {
  const [selected, setSelected] = useState<Station | null>(null);

  const handleSelect = (st: Station) => {
    setSelected(st);
    onLineSelect?.(st.lineNumber);
  };

  const handleClear = () => {
    setSelected(null);
    onLineSelect?.(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <StationSearchInput
        placeholder="역 이름 또는 노선 검색 (예: 관악, 2호선)"
        onSelect={handleSelect}
        value={selected?.name || ""}
      />
      {selected && (
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-white text-xs font-semibold"
            style={{ backgroundColor: selected.lineColor }}
          >
            {selected.line}
          </span>
          <span className="text-sm font-medium">{selected.name}역</span>
          <button
            onClick={handleClear}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-clear-line"
          >
            전체 노선도 보기
          </button>
        </div>
      )}
    </div>
  );
}

function RouteSearch({ onStationSelect }: { onStationSelect?: (station: string) => void }) {
  const [from, setFrom] = useState<Station | null>(null);
  const [to, setTo] = useState<Station | null>(null);
  const [searched, setSearched] = useState(false);

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

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex-1">
          <StationSearchInput
            placeholder="출발역"
            value={from?.name || ""}
            onSelect={(st) => { setFrom(st); setSearched(false); }}
          />
        </div>
        <div className="text-muted-foreground text-sm font-medium">→</div>
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
          size="sm"
          className="flex-shrink-0"
        >
          경로 찾기
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading && (
          <div className="text-sm text-muted-foreground p-2 text-center">경로를 탐색하는 중...</div>
        )}
        {routeResult && !isLoading && (
          <div className="h-full flex flex-col gap-1">
            {/* Summary */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
              <span>총 <strong className="text-foreground">{routeResult.totalStations}개</strong> 역</span>
              <span>환승 <strong className="text-foreground">{routeResult.transferCount}회</strong></span>
              <span>약 <strong className="text-foreground">{routeResult.estimatedTime}분</strong></span>
              {routeResult.segments.map((seg, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: seg.lineColor }} />
                  {seg.line}
                </span>
              ))}
            </div>
            {/* Route horizontal line */}
            <ScrollArea className="flex-1 w-full">
              <div className="flex items-start pb-3 pt-1 pl-2" style={{ minWidth: "max-content" }}>
                {routeResult.segments.map((seg, segIdx) => (
                  <React.Fragment key={segIdx}>
                    {seg.stations.map((stationName, stIdx) => {
                      const isFirst = segIdx === 0 && stIdx === 0;
                      const isLast = segIdx === routeResult.segments.length - 1 && stIdx === seg.stations.length - 1;
                      const isTransfer = stIdx === 0 && segIdx > 0;
                      const isTransferPoint = routeResult.segments.some((s, si) => si !== segIdx && s.stations.includes(stationName));
                      const showLine = stIdx < seg.stations.length - 1 || segIdx < routeResult.segments.length - 1;

                      return (
                        <React.Fragment key={`${segIdx}-${stIdx}`}>
                          {/* Station dot + name */}
                          <div className="flex flex-col items-center" style={{ minWidth: "52px" }}>
                            {/* Dot */}
                            <div className="relative flex items-center justify-center" style={{ height: "24px" }}>
                              {(isTransfer || isFirst || isLast) ? (
                                // Transfer/endpoint: double ring
                                <div
                                  className="rounded-full z-10 relative"
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    backgroundColor: "#ffffff",
                                    border: `3px solid ${seg.lineColor}`,
                                    boxShadow: `0 0 0 2px #ffffff, 0 0 0 4px ${seg.lineColor}`,
                                  }}
                                />
                              ) : (
                                // Normal dot
                                <div
                                  className="rounded-full z-10"
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    backgroundColor: seg.lineColor,
                                  }}
                                />
                              )}
                            </div>
                            {/* Station name */}
                            <span
                              className="text-center whitespace-nowrap leading-tight"
                              style={{
                                fontSize: (isFirst || isLast || isTransfer) ? "11px" : "10px",
                                fontWeight: (isFirst || isLast || isTransfer) ? "700" : "400",
                                color: (isFirst || isLast || isTransfer) ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                                maxWidth: "52px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {stationName}
                            </span>
                          </div>
                          {/* Connector line between stations */}
                          {showLine && !(stIdx === seg.stations.length - 1 && segIdx < routeResult.segments.length - 1) && (
                            <div
                              style={{
                                height: "4px",
                                width: "28px",
                                backgroundColor: seg.lineColor,
                                marginTop: "10px",
                                flexShrink: 0,
                              }}
                            />
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
            <div className="flex-shrink-0 space-y-1">
              {routeResult.segments.map((seg, i) => (
                <div key={i} className="text-xs flex items-center gap-2 px-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.lineColor }}
                  />
                  <span className="text-muted-foreground">{seg.boardingInfo}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && !routeResult && searched && (
          <div className="text-sm text-destructive p-2 text-center">경로를 찾을 수 없습니다</div>
        )}
      </div>
    </div>
  );
}

function ArrivalSearch() {
  const [station, setStation] = useState<Station | null>(null);

  const { data: arrivals, isLoading, refetch } = useGetRealtimeArrival(
    station?.name || "",
    {
      query: {
        enabled: !!station,
        queryKey: getGetRealtimeArrivalQueryKey(station?.name || ""),
      },
    }
  );

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex gap-2 flex-shrink-0">
        <div className="flex-1">
          <StationSearchInput
            placeholder="역 이름 검색 (예: 홍대입구)"
            value={station?.name || ""}
            onSelect={setStation}
          />
        </div>
        {station && (
          <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh-arrival">
            새로고침
          </Button>
        )}
      </div>

      {isLoading && <div className="text-sm text-muted-foreground text-center py-2">도착 정보를 불러오는 중...</div>}

      {arrivals && (
        <div className="flex-1 min-h-0 overflow-auto space-y-1.5">
          {arrivals.arrivals.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">도착 정보가 없습니다</div>
          )}
          {arrivals.arrivals.map((arr, i) => (
            <div
              key={i}
              className="p-2.5 border rounded-lg bg-card flex items-center gap-3"
              data-testid={`arrival-item-${i}`}
            >
              <span
                className="text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: arr.lineColor }}
              >
                {arr.line}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{arr.destination}행</div>
                <div className="text-xs text-muted-foreground truncate">{arr.direction} · 현재: {arr.currentStation}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-primary">{arr.remainingTime}</div>
                {arr.isLastTrain && <div className="text-xs text-destructive">막차</div>}
              </div>
            </div>
          ))}
          {arrivals.updatedAt && (
            <div className="text-xs text-muted-foreground text-right pt-1">
              업데이트: {new Date(arrivals.updatedAt).toLocaleTimeString("ko-KR")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StationSearchInput({
  placeholder,
  onSelect,
  value: initialValue = "",
}: {
  placeholder: string;
  onSelect: (st: Station) => void;
  value?: string;
}) {
  const [query, setQuery] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 250);

  // Sync external value changes
  React.useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const { data: stations } = useSearchStations(
    { q: debouncedQuery },
    {
      query: {
        enabled: debouncedQuery.length > 0,
        queryKey: getSearchStationsQueryKey({ q: debouncedQuery }),
      },
    }
  );

  return (
    <div className="relative w-full">
      <Input
        data-testid={`input-search-${placeholder.replace(/\s/g, "-")}`}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => debouncedQuery.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="h-8 text-sm"
        autoComplete="off"
      />
      {open && stations && stations.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-popover border rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto">
          {stations.map((st) => (
            <div
              key={st.id}
              className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2 text-sm"
              onMouseDown={() => {
                setQuery(st.name);
                onSelect(st);
                setOpen(false);
              }}
              data-testid={`option-station-${st.id}`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: st.lineColor }}
              />
              <span className="font-medium">{st.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{st.line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
