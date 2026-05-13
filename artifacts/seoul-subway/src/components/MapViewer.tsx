import React, { useState, useRef, useCallback, useEffect } from "react";

const LINE_COLORS: Record<string, string> = {
  "1": "#0052A4",
  "2": "#00A84D",
  "3": "#EF7C1C",
  "4": "#00A5DE",
  "5": "#996CAC",
  "6": "#CD7C2F",
  "7": "#747F00",
  "8": "#E6186C",
  "9": "#BDB092",
};

// Schematic lines in a 200x180 coordinate space, spread out for better visibility
const SCHEMATIC_LINES: Array<{
  id: string;
  color: string;
  name: string;
  points: [number, number][];
}> = [
  {
    id: "1", color: "#0052A4", name: "1호선",
    // North-south line through center-left
    points: [
      [88,6],[88,12],[88,18],[88,24],[88,30],[88,36],[88,42],[88,48],
      [88,54],[88,58],[88,64],[88,70],[88,76],[88,82],[88,88],[88,96],
      [88,102],[88,108],[88,114],[88,120],[88,128],[88,136],[88,144]
    ],
  },
  {
    id: "2", color: "#00A84D", name: "2호선",
    // Circular route (oval)
    points: [
      [88,64],[96,60],[104,56],[112,54],[120,54],[128,56],[134,60],
      [138,66],[138,74],[134,80],[128,85],[120,88],[112,88],[104,86],
      [96,82],[90,76],[88,70],[88,64]
    ],
  },
  {
    id: "3", color: "#EF7C1C", name: "3호선",
    // Diagonal NW-SE
    points: [
      [46,12],[50,18],[56,24],[62,30],[68,36],[76,42],[82,48],[88,54],
      [96,60],[104,66],[110,72],[116,80],[120,88],[124,96],[128,104]
    ],
  },
  {
    id: "4", color: "#00A5DE", name: "4호선",
    // North-south through center
    points: [
      [112,6],[112,12],[112,18],[112,24],[112,30],[112,36],[112,42],
      [112,48],[112,54],[112,60],[112,66],[112,72],[112,80],[112,88],
      [112,96],[112,104],[112,112],[112,120],[112,128]
    ],
  },
  {
    id: "5", color: "#996CAC", name: "5호선",
    // East-west line through center
    points: [
      [18,72],[28,72],[38,72],[48,72],[58,72],[68,72],[78,72],[88,72],
      [98,72],[108,72],[118,72],[128,72],[138,72],[146,76],[150,82],
      [150,90],[150,98]
    ],
  },
  {
    id: "6", color: "#CD7C2F", name: "6호선",
    // Loop in upper-center
    points: [
      [52,42],[58,38],[66,34],[74,32],[82,32],[90,34],[98,38],[106,42],
      [112,48],[112,54],[106,58],[98,60],[90,62],[82,62],[74,60],[66,56],
      [60,52],[54,48],[52,44],[52,42]
    ],
  },
  {
    id: "7", color: "#747F00", name: "7호선",
    // North-south on right side, extends to bottom
    points: [
      [106,6],[108,12],[110,18],[112,24],[112,30],[114,36],[116,42],
      [118,48],[120,54],[122,60],[124,66],[126,72],[128,78],[128,86],
      [128,94],[130,102],[134,110],[140,116],[148,120],[158,122],[168,122]
    ],
  },
  {
    id: "8", color: "#E6186C", name: "8호선",
    // Short diagonal line on right side
    points: [
      [138,56],[140,62],[140,70],[138,78],[136,86],[134,94],[132,102],
      [130,110],[128,118],[126,126],[124,134]
    ],
  },
  {
    id: "9", color: "#BDB092", name: "9호선",
    // Horizontal line in south
    points: [
      [22,96],[32,96],[42,96],[52,94],[62,92],[72,90],[82,88],[92,88],
      [102,88],[112,88],[122,88],[132,88],[142,88],[152,90],[160,92],
      [166,96],[170,102]
    ],
  },
];

// Key interchange stations
const TRANSFER_STATIONS: Array<{ name: string; x: number; y: number; lines: string[] }> = [
  { name: "종로3가", x: 88, y: 48, lines: ["1","3","5"] },
  { name: "동대문역사문화공원", x: 112, y: 54, lines: ["2","4","5"] },
  { name: "시청", x: 88, y: 64, lines: ["1","2"] },
  { name: "서울역", x: 88, y: 72, lines: ["1","4"] },
  { name: "사당", x: 112, y: 88, lines: ["2","4"] },
  { name: "교대", x: 112, y: 80, lines: ["2","3"] },
  { name: "고속터미널", x: 120, y: 88, lines: ["3","7","9"] },
  { name: "강남", x: 128, y: 72, lines: ["2"] },
  { name: "잠실", x: 138, y: 66, lines: ["2","8"] },
  { name: "홍대입구", x: 82, y: 62, lines: ["2","경의중앙"] },
  { name: "합정", x: 90, y: 60, lines: ["2","6"] },
  { name: "노원", x: 112, y: 12, lines: ["4","7"] },
  { name: "왕십리", x: 120, y: 72, lines: ["2","5"] },
  { name: "당산", x: 92, y: 88, lines: ["2","9"] },
  { name: "여의도", x: 78, y: 88, lines: ["5","9"] },
  { name: "공덕", x: 68, y: 72, lines: ["5","6"] },
  { name: "건대입구", x: 134, y: 72, lines: ["2","7"] },
  { name: "신도림", x: 88, y: 102, lines: ["1","2"] },
  { name: "천호", x: 150, y: 82, lines: ["5","8"] },
  { name: "가락시장", x: 132, y: 94, lines: ["3","8"] },
];

interface Props {
  onStationClick: (station: string) => void;
  selectedLine?: string | null;
}

export default function MapViewer({ onStationClick, selectedLine }: Props) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.91;
    setTransform(prev => {
      const newScale = Math.min(Math.max(0.4, prev.scale * scaleFactor), 10);
      const ratio = newScale / prev.scale;
      return {
        scale: newScale,
        x: mouseX - ratio * (mouseX - prev.x),
        y: mouseY - ratio * (mouseY - prev.y),
      };
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  const zoom = (factor: number) => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(0.4, prev.scale * factor), 10),
    }));
  };

  const reset = () => setTransform({ x: 0, y: 0, scale: 1 });

  // SVG dimensions
  const SVG_W = 200;
  const SVG_H = 160;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "#0d1117", cursor: isDragging.current ? "grabbing" : "grab", touchAction: "none", userSelect: "none" }}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* SVG scaled to container, then user transform applied */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "top left",
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          {/* Dark background */}
          <rect width={SVG_W} height={SVG_H} fill="#0d1117" />
          {/* Subtle grid */}
          {Array.from({ length: 21 }, (_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 10} y1={0} x2={i * 10} y2={SVG_H} stroke="#161b26" strokeWidth="0.3" />
              <line x1={0} y1={i * 8} x2={SVG_W} y2={i * 8} stroke="#161b26" strokeWidth="0.3" />
            </React.Fragment>
          ))}

          {/* Lines */}
          {SCHEMATIC_LINES.map(line => {
            const active = !selectedLine || selectedLine === line.id;
            return (
              <polyline
                key={line.id}
                points={line.points.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="none"
                stroke={active ? line.color : "#1e2433"}
                strokeWidth={active ? (selectedLine === line.id ? 2 : 1.4) : 0.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: "stroke 0.25s, stroke-width 0.25s" }}
              />
            );
          })}

          {/* Regular station dots */}
          {SCHEMATIC_LINES.map(line => {
            const active = !selectedLine || selectedLine === line.id;
            if (!active) return null;
            return line.points.map(([x, y], idx) => (
              <circle
                key={`dot-${line.id}-${idx}`}
                cx={x} cy={y} r={0.8}
                fill={line.color}
                opacity={0.8}
              />
            ));
          })}

          {/* Transfer/major station rings */}
          {TRANSFER_STATIONS.map(station => {
            const active = !selectedLine || station.lines.includes(selectedLine);
            const isTransfer = station.lines.length >= 2;
            const r = active ? (isTransfer ? 2.2 : 1.4) : 0.6;
            return (
              <g key={station.name} style={{ cursor: "pointer" }} onClick={() => active && onStationClick(station.name)}>
                {/* Outer ring */}
                {active && isTransfer && (
                  <circle cx={station.x} cy={station.y} r={r + 0.8} fill="none" stroke="#ffffff22" strokeWidth="0.6" />
                )}
                <circle
                  cx={station.x} cy={station.y} r={r}
                  fill={active ? "#ffffff" : "#1e2433"}
                  stroke={active ? "#aaaaaa" : "none"}
                  strokeWidth={0.3}
                  style={{ transition: "all 0.25s" }}
                />
              </g>
            );
          })}

          {/* Station labels — always show major ones at default zoom */}
          {TRANSFER_STATIONS.map(station => {
            const active = !selectedLine || station.lines.includes(selectedLine);
            if (!active) return null;
            const isTransfer = station.lines.length >= 2;
            if (!isTransfer) return null;
            return (
              <text
                key={`lbl-${station.name}`}
                x={station.x + 2.8}
                y={station.y + 1.2}
                fontSize="3.2"
                fill={active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.15)"}
                fontFamily="'Noto Sans KR', 'Apple SD Gothic Neo', system-ui, sans-serif"
                style={{ pointerEvents: "none", transition: "fill 0.25s" }}
              >
                {station.name}
              </text>
            );
          })}

          {/* Legend top-left */}
          {SCHEMATIC_LINES.map((line, i) => {
            const active = !selectedLine || selectedLine === line.id;
            return (
              <g key={`leg-${line.id}`}>
                <rect x={2} y={2 + i * 8} width={4} height={3} rx={0.5} fill={active ? line.color : "#333"} style={{ transition: "fill 0.25s" }} />
                <text x={8} y={4.8 + i * 8} fontSize="3.2" fill={active ? "#cccccc" : "#333"} fontFamily="system-ui, sans-serif" style={{ transition: "fill 0.25s" }}>
                  {line.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
        {[
          { label: "+", factor: 1.3, testid: "button-zoom-in" },
          { label: "−", factor: 0.77, testid: "button-zoom-out" },
        ].map(btn => (
          <button
            key={btn.testid}
            data-testid={btn.testid}
            className="w-9 h-9 rounded-md border border-white/20 bg-white/10 text-white text-xl font-semibold hover:bg-white/20 active:bg-white/30 transition-colors flex items-center justify-center leading-none"
            onClick={() => zoom(btn.factor)}
          >
            {btn.label}
          </button>
        ))}
        <button
          data-testid="button-reset"
          className="w-9 h-9 rounded-md border border-white/20 bg-white/10 text-white text-xs hover:bg-white/20 transition-colors flex items-center justify-center"
          onClick={reset}
          title="초기화"
        >
          ⊙
        </button>
      </div>

      {/* Selected line badge */}
      {selectedLine && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div
            className="px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg"
            style={{ backgroundColor: LINE_COLORS[selectedLine] || "#555" }}
          >
            {selectedLine}호선
          </div>
        </div>
      )}

      {/* Interaction hint */}
      <div className="absolute bottom-4 left-4 text-xs text-white/30 pointer-events-none select-none">
        드래그·스크롤로 이동/확대 | 환승역 클릭 → 실내 안내
      </div>
    </div>
  );
}
