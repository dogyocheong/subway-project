import React, { useState, useRef, useCallback, useEffect } from "react";
import MapViewer from "@/components/MapViewer";
import ControlPanel from "@/components/ControlPanel";

const MIN_PANEL_PX = 140;
const MAX_PANEL_VH = 80;

export default function Home() {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  // Panel height as a fraction of viewport height (default 40%)
  const [panelFraction, setPanelFraction] = useState(0.40);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartFraction = useRef(0);

  const onDragStart = useCallback((e: React.PointerEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.PointerEvent).clientY;
    dragStartY.current = clientY;
    dragStartFraction.current = panelFraction;
    if ("setPointerCapture" in e.currentTarget) {
      (e.currentTarget as Element).setPointerCapture((e as React.PointerEvent).pointerId);
    }
  }, [panelFraction]);

  const onDragMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const totalH = containerRef.current.clientHeight;
    const dy = dragStartY.current - e.clientY;
    const newFraction = dragStartFraction.current + dy / totalH;
    const minFraction = MIN_PANEL_PX / totalH;
    const maxFraction = MAX_PANEL_VH / 100;
    setPanelFraction(Math.min(Math.max(minFraction, newFraction), maxFraction));
  }, []);

  const onDragEnd = useCallback(() => { isDragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragEnd);
    return () => {
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragEnd);
    };
  }, [onDragMove, onDragEnd]);

  return (
    <div ref={containerRef} className="flex flex-col h-[100dvh] w-full overflow-hidden bg-background">
      {/* Map area — grows to fill remaining space */}
      <div className="overflow-hidden relative" style={{ flex: `0 0 ${(1 - panelFraction) * 100}%` }}>
        <MapViewer
          onStationClick={setSelectedStation}
          selectedLine={selectedLine}
          onLineSelect={setSelectedLine}
        />
      </div>

      {/* ── Drag handle ── */}
      <div
        className="flex-shrink-0 flex items-center justify-center bg-white border-t border-b cursor-row-resize select-none group z-20 relative"
        style={{ height: "18px", touchAction: "none" }}
        onPointerDown={onDragStart as any}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 group-hover:bg-gray-500 transition-colors" />
        <span className="absolute right-2 text-gray-300 text-xs pointer-events-none">↕</span>
      </div>

      {/* Control panel — fills panelFraction of viewport */}
      <div
        className="border-t bg-card relative z-10 shadow-inner flex-shrink-0 overflow-hidden"
        style={{ flex: `0 0 calc(${panelFraction * 100}% - 18px)` }}
      >
        <ControlPanel
          onLineSelect={setSelectedLine}
          onStationSelect={setSelectedStation}
        />
      </div>
    </div>
  );
}
