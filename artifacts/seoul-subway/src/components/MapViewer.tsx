import React, { useState, useRef, useCallback, useEffect } from "react";
import subwayAllImg from "@assets/subway_1778689471786.png";
import line1Img from "@assets/image_1778689525352.png";
import line2Img from "@assets/image_1778689588439.png";
import line3Img from "@assets/image_1778689634798.png";
import line4Img from "@assets/image_1778689670408.png";
import line5Img from "@assets/image_1778689698601.png";
import line6Img from "@assets/image_1778689762968.png";
import line7Img from "@assets/image_1778689778332.png";
import line8Img from "@assets/image_1778689833118.png";
import line9Img from "@assets/image_1778689918077.png";

const LINE_MAP_IMAGES: Record<string, string> = {
  all: subwayAllImg,
  "1": line1Img,
  "2": line2Img,
  "3": line3Img,
  "4": line4Img,
  "5": line5Img,
  "6": line6Img,
  "7": line7Img,
  "8": line8Img,
  "9": line9Img,
};

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
  "경의중앙": "#77C4A3",
  "공항": "#4EA4D4",
  "수인분당": "#F5A200",
  "신분당": "#D31145",
  "경춘": "#0C8E72",
  "우이신설": "#B0CE18",
  "신림": "#6789CA",
  "김포골드": "#9DC15D",
  "GTX-A": "#005EB8",
};

const LINE_NAMES: Record<string, string> = {
  "1": "1호선", "2": "2호선", "3": "3호선", "4": "4호선", "5": "5호선",
  "6": "6호선", "7": "7호선", "8": "8호선", "9": "9호선",
  "경의중앙": "경의중앙선", "공항": "공항철도", "수인분당": "수인분당선",
  "신분당": "신분당선", "경춘": "경춘선", "우이신설": "우이신설선",
  "신림": "신림선", "김포골드": "김포골드라인", "GTX-A": "GTX-A",
};

interface Props {
  onStationClick: (station: string) => void;
  selectedLine?: string | null;
  onLineSelect?: (line: string | null) => void;
}

export default function MapViewer({ onStationClick, selectedLine, onLineSelect }: Props) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const currentImage = selectedLine && LINE_MAP_IMAGES[selectedLine]
    ? LINE_MAP_IMAGES[selectedLine]
    : LINE_MAP_IMAGES.all;

  // Reset transform when line changes
  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, [selectedLine]);

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
      const newScale = Math.min(Math.max(0.3, prev.scale * scaleFactor), 12);
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
      scale: Math.min(Math.max(0.3, prev.scale * factor), 12),
    }));
  };

  const reset = () => setTransform({ x: 0, y: 0, scale: 1 });

  const allLineKeys = Object.keys(LINE_NAMES);

  return (
    <div className="relative w-full h-full flex flex-col" style={{ background: "#f8f8f8" }}>
      {/* Line selector top bar */}
      <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 bg-white border-b overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => onLineSelect?.(null)}
          className="flex-shrink-0 px-2.5 py-1 rounded text-xs font-bold border transition-all"
          style={{
            backgroundColor: !selectedLine ? "#333" : "transparent",
            color: !selectedLine ? "#fff" : "#555",
            borderColor: !selectedLine ? "#333" : "#ddd",
          }}
        >
          전체
        </button>
        {allLineKeys.map(lineId => (
          <button
            key={lineId}
            onClick={() => onLineSelect?.(selectedLine === lineId ? null : lineId)}
            className="flex-shrink-0 px-2.5 py-1 rounded text-xs font-bold border transition-all"
            style={{
              backgroundColor: selectedLine === lineId ? LINE_COLORS[lineId] : "transparent",
              color: selectedLine === lineId ? "#fff" : LINE_COLORS[lineId],
              borderColor: LINE_COLORS[lineId],
              minWidth: "fit-content",
            }}
          >
            {LINE_NAMES[lineId]}
          </button>
        ))}
      </div>

      {/* Map image area */}
      <div
        className="flex-1 overflow-hidden relative"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          cursor: isDragging.current ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          background: selectedLine && ["1","2","3","4","5","6","7","8","9"].includes(selectedLine) ? "#ffffff" : "#f0f0f0",
        }}
      >
        <div
          style={{
            position: "absolute",
            transformOrigin: "top left",
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            ref={imgRef}
            src={currentImage}
            alt={selectedLine ? `${LINE_NAMES[selectedLine] || selectedLine} 노선도` : "서울 지하철 노선도"}
            draggable={false}
            style={{
              maxWidth: "none",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
          <button
            data-testid="button-zoom-in"
            className="w-9 h-9 rounded-md border border-gray-300 bg-white text-xl font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors flex items-center justify-center leading-none"
            onClick={() => zoom(1.3)}
          >+</button>
          <button
            data-testid="button-zoom-out"
            className="w-9 h-9 rounded-md border border-gray-300 bg-white text-xl font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors flex items-center justify-center leading-none"
            onClick={() => zoom(0.77)}
          >−</button>
          <button
            data-testid="button-reset"
            className="w-9 h-9 rounded-md border border-gray-300 bg-white text-xs text-gray-500 hover:bg-gray-50 shadow-sm transition-colors flex items-center justify-center"
            onClick={reset}
            title="초기화"
          >⊙</button>
        </div>

        {/* Current line badge */}
        {selectedLine && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div
              className="px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg"
              style={{ backgroundColor: LINE_COLORS[selectedLine] || "#555" }}
            >
              {LINE_NAMES[selectedLine] || selectedLine}
            </div>
          </div>
        )}

        {/* Hint */}
        <div className="absolute bottom-3 left-3 text-xs text-gray-400 pointer-events-none select-none bg-white/70 px-2 py-0.5 rounded">
          드래그·스크롤 이동/확대
        </div>
      </div>
    </div>
  );
}
