import React, { useEffect, useRef, useState, useCallback } from "react";

interface ToiletInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
  phone: string;
  type: string;
  male: string;
  female: string;
  disabledM: string;
  disabledF: string;
  babyChange: string;
  cctv: string;
  distance?: number;
}

interface Props {
  onClose: () => void;
}

export default function ToiletMap({ onClose }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<ToiletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<"waiting" | "ok" | "denied" | "unsupported">("waiting");

  const fetchToilets = useCallback(async (lat: number, lng: number, L: any, map: any) => {
    try {
      const resp = await fetch(`/api/subway/toilets?lat=${lat}&lng=${lng}&radius=2000`);
      const toilets: ToiletInfo[] = await resp.json();
      setCount(toilets.length);

      // Remove old toilet markers (not user marker)
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const toiletIcon = L.divIcon({
        className: "",
        html: `<div style="background:#4f86f7;border:2px solid #fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:pointer;line-height:1">🚻</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      toilets.forEach(t => {
        const marker = L.marker([t.lat, t.lng], { icon: toiletIcon });
        marker.on("click", () => setSelected(t));
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    } catch {
      // silently ignore
    }
    setLoading(false);
  }, []);

  const recenterToUser = useCallback(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (userPos) {
      map.setView([userPos.lat, userPos.lng], 16, { animate: true });
      return;
    }
    // If we don't have GPS yet, try again
    if (!navigator.geolocation) return;
    setGpsStatus("waiting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserPos({ lat, lng });
        setGpsStatus("ok");
        map.setView([lat, lng], 16, { animate: true });
        const L = await import("leaflet");
        if (userMarkerRef.current) userMarkerRef.current.setLatLng([lat, lng]);
        fetchToilets(lat, lng, L, map);
      },
      () => setGpsStatus("denied"),
      { timeout: 8000 }
    );
  }, [userPos, fetchToilets]);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      if (cancelled || leafletMapRef.current) return;

      const defaultLat = 37.5665, defaultLng = 126.9780;
      const map = L.map(mapRef.current!, { center: [defaultLat, defaultLng], zoom: 15, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      leafletMapRef.current = map;

      const userDotHtml = `<div style="background:#ff4444;border:3px solid #fff;border-radius:50%;width:18px;height:18px;box-shadow:0 2px 8px rgba(255,0,0,0.5)"></div>`;
      const userIcon = L.divIcon({ className: "", html: userDotHtml, iconSize: [18, 18], iconAnchor: [9, 9] });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const lat = pos.coords.latitude, lng = pos.coords.longitude;
            setUserPos({ lat, lng });
            setGpsStatus("ok");

            const marker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 });
            marker.bindTooltip("📍 현재 위치", { permanent: false }).addTo(map);
            userMarkerRef.current = marker;
            L.circle([lat, lng], { radius: pos.coords.accuracy, color: "#ff4444", fillColor: "#ff4444", fillOpacity: 0.08, weight: 1 }).addTo(map);
            map.setView([lat, lng], 16);
            fetchToilets(lat, lng, L, map);
          },
          () => {
            if (cancelled) return;
            setGpsStatus("denied");
            fetchToilets(defaultLat, defaultLng, L, map);
          },
          { timeout: 8000 }
        );
      } else {
        setGpsStatus("unsupported");
        fetchToilets(defaultLat, defaultLng, L, map);
      }

      map.on("moveend", async () => {
        const center = map.getCenter();
        const L2 = await import("leaflet");
        fetchToilets(center.lat, center.lng, L2, map);
      });
    };

    initMap();
    return () => {
      cancelled = true;
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; }
    };
  }, [fetchToilets]);

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white">
        <span className="text-base">🚻</span>
        <span className="font-bold text-sm">공중화장실 지도</span>
        {!loading && <span className="text-xs opacity-75 ml-0.5">주변 {count}개</span>}
        {loading && <span className="text-xs opacity-75 animate-pulse ml-0.5">로딩 중...</span>}

        <div className="ml-auto flex items-center gap-1.5">
          {/* 내 위치로 — always visible */}
          <button
            onClick={recenterToUser}
            title="내 위치로 이동"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-blue-600 text-xs font-bold shadow hover:bg-blue-50 transition-all active:scale-95"
            style={{ minWidth: "72px" }}
          >
            <span>📍</span>
            <span>{gpsStatus === "waiting" ? "위치 찾는 중..." : gpsStatus === "denied" ? "위치 허용 필요" : "내 위치"}</span>
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full text-xl font-bold transition-all">×</button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0" ref={mapRef} />

      {/* Legend bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-3 py-1.5 bg-gray-50 border-t text-xs text-gray-500">
        <div className="flex items-center gap-1"><span style={{ fontSize: 14 }}>🚻</span> 공중화장실</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500 border-white border-2 shadow-sm" /> 현재 위치</div>
        <span className="ml-auto text-gray-400">지도 이동 시 자동 갱신</span>
      </div>

      {/* Selected toilet detail panel */}
      {selected && (
        <div className="absolute bottom-12 left-2 right-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 z-[1000] max-w-sm mx-auto">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm flex items-center gap-1.5 flex-wrap">
                <span>🚻</span>
                <span className="truncate">{selected.name}</span>
                {selected.type && <span className="text-xs font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">{selected.type}</span>}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">{selected.address}</div>
            </div>
            <button onClick={() => setSelected(null)} className="flex-shrink-0 text-gray-400 hover:text-gray-700 text-xl leading-none w-6 flex items-center justify-center">×</button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
            <div><span className="text-gray-400">개방시간</span> <span className="font-medium">{selected.hours || "정보 없음"}</span></div>
            <div><span className="text-gray-400">전화</span> <span className="font-medium">{selected.phone || "-"}</span></div>
            <div><span className="text-gray-400">남성</span> 대변기 {selected.male}개</div>
            <div><span className="text-gray-400">여성</span> 대변기 {selected.female}개</div>
            {(Number(selected.disabledM) > 0 || Number(selected.disabledF) > 0) && (
              <div><span className="text-gray-400">장애인칸</span> 남{selected.disabledM} 여{selected.disabledF}</div>
            )}
            {selected.babyChange === "Y" && <div className="text-blue-600 font-medium">👶 기저귀 교환대 있음</div>}
            {selected.cctv === "Y" && <div className="text-green-600 font-medium">📷 CCTV 설치</div>}
            {selected.distance != null && (
              <div className="col-span-2 text-gray-400 mt-0.5">현재 위치에서 약 <span className="font-semibold text-gray-600">{selected.distance}m</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
