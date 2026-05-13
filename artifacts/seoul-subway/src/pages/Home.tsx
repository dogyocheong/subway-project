import React, { useState } from "react";
import MapViewer from "@/components/MapViewer";
import ControlPanel from "@/components/ControlPanel";

export default function Home() {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-background">
      {/* Map: 4/5 of screen */}
      <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <MapViewer
          onStationClick={setSelectedStation}
          selectedLine={selectedLine}
          onLineSelect={setSelectedLine}
        />
      </div>
      {/* Control panel: 1/5 of screen */}
      <div
        className="border-t bg-card relative z-10 shadow-lg flex-shrink-0"
        style={{ height: "20vh", minHeight: "170px", maxHeight: "280px" }}
      >
        <ControlPanel
          onLineSelect={setSelectedLine}
          onStationSelect={setSelectedStation}
        />
      </div>
    </div>
  );
}
