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
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const recenterToUser = useCallback(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (userPos) {
      map.setView([userPos.lat, userPos.lng], 16, { animate: true });
      return;
    }
    if (!navigator.geolocation) return;
    setGpsStatus("waiting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
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

      const userIcon = L.divIcon({
        className: "",
        html: `<div style="background:#ef4444;border:3px solid #fff;border-radius:50%;width:18px;height:18px;box-shadow:0 2px 8px rgba(239,68,68,0.5)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const { latitude: lat, longitude: lng, accuracy } = pos.coords;
            setUserPos({ lat, lng });
            setGpsStatus("ok");
            const marker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 });
            marker.bindTooltip("📍 현재 위치", { permanent: false }).addTo(map);
            userMarkerRef.current = marker;
            L.circle([lat, lng], { radius: accuracy, color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.08, weight: 1 }).addTo(map);
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

  // GPS label
  const gpsLabel =
    gpsStatus === "waiting" ? "위치 확인 중..." :
    gpsStatus === "denied" ? "위치 허용 필요" :
    gpsStatus === "unsupported" ? "GPS 미지원" :
    userPos ? `${userPos.lat.toFixed(4)}, ${userPos.lng.toFixed(4)}` : "확인 중...";

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white">

      {/* ── 슬림 타이틀바 (파란색 없음) ── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border-b shadow-sm">
        <span className="text-sm">🚻</span>
        <span className="text-sm font-semibold text-gray-700">공중화장실 지도</span>
        {loading && <span className="text-xs text-gray-400 animate-pulse">로딩 중...</span>}
        <button
          onClick={onClose}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-lg transition-all"
          title="닫기"
        >×</button>
      </div>

      {/* ── 지도 ── */}
      <div className="flex-1 min-h-0 relative" ref={mapRef} />

      {/* ── 정보 바 (내 위치 + 화장실 개수 + 내 위치로 버튼) ── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-50 border-t text-xs flex-wrap">
        {/* 범례 */}
        <div className="flex items-center gap-1 text-gray-500">
          <span>🚻</span>
          <span>공중화장실</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0" />
          <span>현재 위치</span>
        </div>

        {/* 구분선 */}
        <div className="h-3 w-px bg-gray-300" />

        {/* 내 위치 좌표 */}
        <div className="flex items-center gap-1">
          <span className="text-gray-400">📍</span>
          <span className={gpsStatus === "ok" ? "text-gray-700 font-medium" : "text-gray-400 italic"}>
            {gpsLabel}
          </span>
        </div>

        {/* 구분선 */}
        <div className="h-3 w-px bg-gray-300" />

        {/* 주변 화장실 개수 */}
        <div className="flex items-center gap-1">
          <span className="text-gray-400">반경 2km</span>
          <span className="font-semibold text-gray-700">{loading ? "..." : `${count}개`}</span>
        </div>

        {/* 내 위치로 버튼 */}
        <button
          onClick={recenterToUser}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 text-xs font-medium transition-all active:scale-95"
        >
          <span>📍</span>
          <span>내 위치로</span>
        </button>
      </div>

      {/* ── 화장실 상세 팝업 ── */}
      {selected && (
        <div
          className="absolute bottom-14 left-2 right-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-[1000] max-w-sm mx-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm flex items-center gap-1.5 flex-wrap">
                <span>🚻</span>
                <span className="truncate">{selected.name}</span>
                {selected.type && (
                  <span className="text-xs font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">{selected.type}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">{selected.address}</div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-700 text-xl leading-none w-6 flex items-center justify-center"
            >×</button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
            <div><span className="text-gray-400">개방시간</span> <span className="font-medium">{selected.hours || "정보 없음"}</span></div>
            <div><span className="text-gray-400">전화</span> <span className="font-medium">{selected.phone || "-"}</span></div>
            <div><span className="text-gray-400">남성</span> 대변기 {selected.male}개</div>
            <div><span className="text-gray-400">여성</span> 대변기 {selected.female}개</div>
            {(Number(selected.disabledM) > 0 || Number(selected.disabledF) > 0) && (
              <div><span className="text-gray-400">장애인</span> 남{selected.disabledM} 여{selected.disabledF}</div>
            )}
            {selected.babyChange === "Y" && <div className="text-blue-600 font-medium">👶 기저귀 교환대</div>}
            {selected.cctv === "Y" && <div className="text-green-600 font-medium">📷 CCTV</div>}
            {selected.distance != null && (
              <div className="col-span-2 text-gray-400 mt-1">
                현재 위치에서 약 <span className="font-semibold text-gray-700">{selected.distance}m</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
