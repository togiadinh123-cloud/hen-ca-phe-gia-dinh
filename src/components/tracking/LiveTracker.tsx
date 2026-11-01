"use client";

import { useState, useEffect, useRef } from "react";
import { Navigation, Play, Square, AlertTriangle, ShieldCheck, MapPin, Clock } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { EventModel, EventPlace, Profile } from "@/types/database";
import { calculateHaversineDistance, formatDistance } from "@/lib/geo";

interface LiveTrackerProps {
  event: EventModel;
  currentUser: Profile;
  venue: EventPlace | null | undefined;
  onLocationUpdate: () => void;
}

export default function LiveTracker({
  event,
  currentUser,
  venue,
  onLocationUpdate,
}: LiveTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [lastCoord, setLastCoord] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastSendTimeRef = useRef<number>(0);

  // Check if participant already marked as location sharing
  useEffect(() => {
    const participant = dataStore.participants.find(
      (p) => p.event_id === event.id && p.user_id === currentUser.id
    );
    if (participant?.location_sharing_enabled) {
      setIsTracking(true);
    }
  }, [event.id, currentUser.id]);

  const handleStartTracking = () => {
    setShowPermissionModal(true);
  };

  const confirmPermissionAndStart = () => {
    setShowPermissionModal(false);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg("Trình duyệt của bạn không hỗ trợ định vị Geolocation.");
      return;
    }

    setIsTracking(true);

    // Initial GPS fetch
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePositionReceived(pos);
      },
      (err) => {
        setErrorMsg(`Không thể lấy vị trí GPS: ${err.message}`);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    // Watch continuous GPS updates with throttling
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        handlePositionReceived(pos);
      },
      (err) => {
        console.warn("watchPosition warning:", err);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  };

  const handlePositionReceived = (pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy, heading, speed } = pos.coords;
    setLastCoord({ lat: latitude, lng: longitude, accuracy });
    setLastUpdated(new Date());

    const now = Date.now();
    // Throttle: Send to server every 20 seconds
    if (now - lastSendTimeRef.current > 20000) {
      lastSendTimeRef.current = now;
      dataStore.updateLiveLocation(
        event.id,
        currentUser.id,
        latitude,
        longitude,
        accuracy,
        heading || undefined,
        speed || undefined
      );
      onLocationUpdate();
    }
  };

  const handleStopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    dataStore.stopLocationSharing(event.id, currentUser.id);
    onLocationUpdate();
  };

  // Distance to venue calculation
  let distanceToVenue: number | null = null;
  if (lastCoord && venue) {
    distanceToVenue = calculateHaversineDistance(
      lastCoord.lat,
      lastCoord.lng,
      venue.latitude,
      venue.longitude
    );
  }

  return (
    <div className="coffee-card p-5 bg-white border border-espresso-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isTracking ? "bg-sage-100 text-sage-800" : "bg-cream-200 text-espresso"
            }`}
          >
            <Navigation className={`w-5 h-5 ${isTracking ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-espresso">Chia sẻ hành trình di chuyển</h4>
            <p className="text-xs text-muted-gray">
              {isTracking
                ? "Đang phát vị trí thời gian thực cho bạn bè trong kèo."
                : "Bật GPS khi bạn bắt đầu xuất phát để bạn bè biết bạn đang tới đâu."}
            </p>
          </div>
        </div>

        <div>
          {isTracking ? (
            <button
              onClick={handleStopTracking}
              className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Dừng chia sẻ vị trí</span>
            </button>
          ) : (
            <button
              onClick={handleStartTracking}
              className="px-4 py-2.5 rounded-xl bg-caramel hover:bg-caramel-600 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Bắt đầu di chuyển</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Status Details */}
      {isTracking && lastCoord && (
        <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-sage font-bold">
              <span className="w-2 h-2 rounded-full bg-sage animate-ping"></span>
              <span>Đang gửi tọa độ</span>
            </span>

            {distanceToVenue !== null && (
              <span className="text-muted-gray">
                Còn cách quán: <strong className="text-espresso">{formatDistance(distanceToVenue)}</strong>
              </span>
            )}
          </div>

          <div className="text-[11px] text-muted-gray flex items-center space-x-2">
            <span>Sai số GPS: ±{Math.round(lastCoord.accuracy)}m</span>
            <span>•</span>
            <span>Cập nhật lúc: {lastUpdated?.toLocaleTimeString("vi-VN")}</span>
          </div>
        </div>
      )}

      {/* Permission Explanation Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="coffee-card p-6 bg-white max-w-md w-full rounded-2xl shadow-2xl border border-espresso-100">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-espresso-100">
              <div className="w-10 h-10 rounded-xl bg-caramel/10 text-caramel flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-espresso text-base">Chia sẻ vị trí tự nguyện</h3>
                <p className="text-[11px] text-muted-gray">Nguyên tắc minh bạch & riêng tư</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-muted-gray mb-6 leading-relaxed">
              <p>
                Trình duyệt sẽ yêu cầu bạn cấp quyền truy cập vị trí (GPS). Dữ liệu này chỉ phục vụ mục đích:
              </p>
              <ul className="list-disc list-inside space-y-1 text-espresso pl-1 font-medium">
                <li>Hiển thị khoảng cách và ETA trên bản đồ cho bạn bè trong cùng kèo.</li>
                <li>Xác minh bạn có mặt trong bán kính 100m quanh quán khi check-in.</li>
                <li>Tự động dừng hoàn toàn khi bạn check-in hoặc bấm dừng.</li>
              </ul>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-espresso-200 text-xs font-bold text-espresso hover:bg-cream-100"
              >
                Để sau
              </button>
              <button
                onClick={confirmPermissionAndStart}
                className="w-1/2 py-2.5 rounded-xl bg-espresso hover:bg-caramel text-white text-xs font-bold transition-colors shadow-sm"
              >
                Tôi đồng ý & Bật GPS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
