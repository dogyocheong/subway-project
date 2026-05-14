import React, { useEffect, useRef, useState } from "react";
import type { Map, Marker, TileLayer, CircleMarker } from "leaflet";

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
  const leafletMapRef = useRef<Map | null>(null);
  const markersRef = useRef<(Marker | CircleMarker)[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<ToiletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);

  const fetchToilets = async (lat: number, lng: number, L: typeof import("leaflet"), map: Map) => {
    try {
      const radius = 2000;
      const resp = await fetch(`/api/subway/toilets?lat=${lat}&lng=${lng}&radius=${radius}`);
      const toilets: ToiletInfo[] = await resp.json();
      setCount(toilets.length);

      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Custom toilet icon
      const toiletIcon = L.divIcon({
        className: "",
        html: `<div style="background:#4f86f7;border:2px solid #fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:pointer">🚻</div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      toilets.forEach(t => {
        const marker = L.marker([t.lat, t.lng], { icon: toiletIcon });
        marker.on("click", () => setSelected(t));
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    } catch (e) {
      setError("화장실 데이터를 불러오지 못했습니다");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");
      // Fix leaflet default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (cancelled || leafletMapRef.current) return;

      // Default Seoul center
      const defaultLat = 37.5665;
      const defaultLng = 126.9780;

      const map = L.map(mapRef.current!, {
        center: [defaultLat, defaultLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;

      // Try to get user location
      setGpsLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserPos({ lat, lng });
            setGpsLoading(false);

            // User location marker
            const userIcon = L.divIcon({
              className: "",
              html: `<div style="background:#ff4444;border:3px solid #fff;border-radius:50%;width:18px;height:18px;box-shadow:0 2px 8px rgba(255,0,0,0.5)"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            const userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 });
            userMarker.bindTooltip("📍 현재 위치", { permanent: false }).addTo(map);
            markersRef.current.push(userMarker);

            // Accuracy circle
            L.circle([lat, lng], { radius: pos.coords.accuracy, color: "#ff4444", fillColor: "#ff4444", fillOpacity: 0.1, weight: 1 }).addTo(map);

            map.setView([lat, lng], 15);
            fetchToilets(lat, lng, L, map);
          },
          () => {
            setGpsLoading(false);
            fetchToilets(defaultLat, defaultLng, L, map);
          },
          { timeout: 8000 }
        );
      } else {
        setGpsLoading(false);
        fetchToilets(defaultLat, defaultLng, L, map);
      }

      // Reload toilets when map moves
      map.on("moveend", async () => {
        const center = map.getCenter();
        const L2 = await import("leaflet");
        fetchToilets(center.lat, center.lng, L2, map);
      });
    };

    initMap();

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (!leafletMapRef.current || !userPos) return;
    leafletMapRef.current.setView([userPos.lat, userPos.lng], 15);
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white">
        <span className="text-lg">🚻</span>
        <span className="font-bold text-sm">공중화장실 지도</span>
        {!loading && <span className="text-xs opacity-80 ml-1">주변 {count}개</span>}
        {(loading || gpsLoading) && <span className="text-xs opacity-80 animate-pulse ml-1">로딩중...</span>}
        {userPos && (
          <button
            onClick={handleRecenter}
            className="ml-auto text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded flex items-center gap-1"
          >
            📍 내 위치
          </button>
        )}
        <button
          onClick={onClose}
          className="ml-auto text-lg font-bold w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded"
        >×</button>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0" ref={mapRef} />

      {/* Legend */}
      <div className="flex-shrink-0 flex items-center gap-3 px-3 py-1.5 bg-gray-50 border-t text-xs text-gray-600">
        <div className="flex items-center gap-1"><span style={{ color: "#4f86f7" }}>🚻</span> 공중화장실</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow" /> 현재 위치</div>
        <div className="text-xs text-gray-400 ml-auto">지도 이동 시 자동 갱신</div>
      </div>

      {/* Selected toilet detail */}
      {selected && (
        <div
          className="absolute bottom-10 left-2 right-2 bg-white rounded-xl shadow-2xl border p-3 z-[1000] max-w-sm mx-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>🚻</span>
                <span>{selected.name}</span>
                <span className="text-xs font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{selected.type}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{selected.address}</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-lg leading-none flex-shrink-0">×</button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
            <div><span className="text-gray-400">개방시간</span> {selected.hours || "정보 없음"}</div>
            <div><span className="text-gray-400">전화</span> {selected.phone || "-"}</div>
            <div><span className="text-gray-400">남성 칸수</span> 대변기 {selected.male}개</div>
            <div><span className="text-gray-400">여성 칸수</span> 대변기 {selected.female}개</div>
            {(selected.disabledM !== "0" || selected.disabledF !== "0") && (
              <div><span className="text-gray-400">장애인</span> 남{selected.disabledM} 여{selected.disabledF}</div>
            )}
            {selected.babyChange === "Y" && <div className="text-blue-600">👶 기저귀 교환대</div>}
            {selected.cctv === "Y" && <div className="text-green-600">📷 CCTV 설치</div>}
            {selected.distance != null && (
              <div className="col-span-2 text-gray-400">현재 위치에서 약 {selected.distance}m</div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-[999]">
          <div className="bg-white rounded-lg p-4 text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
}
