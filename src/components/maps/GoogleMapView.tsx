"use client";

import { useEffect, useRef, useState } from "react";
import { EventModel, EventPlace, LiveLocation, Profile } from "@/types/database";
import { MapPin, Navigation, Compass, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { formatDistance, isLocationStale } from "@/lib/geo";

interface GoogleMapViewProps {
  venue: EventPlace | null | undefined;
  locations: (LiveLocation & { profile?: Profile; distanceMeters?: number; etaMinutes?: number })[];
  userLocation: { latitude: number; longitude: number } | null;
  onRefresh?: () => void;
}

export default function GoogleMapView({
  venue,
  locations,
  userLocation,
  onRefresh,
}: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="coffee-card overflow-hidden border border-espresso-100 bg-white shadow-sm flex flex-col">
      {/* Map Control Bar */}
      <div className="px-5 py-3.5 border-b border-espresso-100 flex items-center justify-between bg-cream-50/70">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-caramel" />
          <h3 className="font-bold text-xs sm:text-sm text-espresso">
            Bản đồ hành trình bạn bè (Live)
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 font-bold">
            {locations.length} người đang chia sẻ
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {venue && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-caramel hover:underline flex items-center space-x-1"
            >
              <span>Chỉ đường</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded-lg hover:bg-cream-200 text-espresso transition-colors"
              title="Làm mới vị trí"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas & Simulated Viewport */}
      <div className="relative h-80 sm:h-96 w-full bg-cream-100 flex items-center justify-center overflow-hidden">
        {/* Subtle grid pattern resembling streets */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#3B2A22 1px, transparent 1px), radial-gradient(#3B2A22 1px, #FFF8EF 1px)`,
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        ></div>

        {/* 100m Geofence Circle overlay around the venue */}
        {venue && (
          <div className="absolute w-44 h-44 rounded-full border-2 border-sage/50 bg-sage/10 animate-pulse flex items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold text-sage-800 uppercase tracking-wider bg-white/80 px-1.5 py-0.5 rounded-full shadow-xs">
              Vùng check-in &lt; 100m
            </span>
          </div>
        )}

        {/* Venue Center Marker */}
        {venue ? (
          <div className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 rounded-full bg-espresso text-cream shadow-xl border-2 border-white flex items-center justify-center font-bold">
              ☕
            </div>
            <div className="mt-1 px-2.5 py-1 rounded-lg bg-espresso text-white text-[11px] font-bold whitespace-nowrap shadow-md">
              {venue.place_name}
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-espresso-100 max-w-xs">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-espresso">Chưa chốt địa điểm</p>
            <p className="text-[11px] text-muted-gray mt-1">
              Sau khi bình chọn và chốt quán, bản đồ sẽ hiển thị vị trí quán và vòng bán kính check-in 100m.
            </p>
          </div>
        )}

        {/* Traveling Friends Pins */}
        {locations.map((loc, idx) => {
          // Offsets for visual representation around center
          const angle = (idx * (2 * Math.PI)) / Math.max(locations.length, 1) + 0.8;
          const radius = 100 + idx * 25;
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;

          const isStale = isLocationStale(loc.updated_at);
          const name = loc.profile?.display_name || "Bạn bè";

          return (
            <div
              key={loc.id}
              onClick={() => setSelectedMarker(loc.user_id)}
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px)`,
              }}
              className="absolute z-30 cursor-pointer flex flex-col items-center transition-all hover:scale-110"
            >
              <div
                className={`relative w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center text-xs font-bold text-white ${
                  isStale ? "bg-gray-400 border-gray-200" : "bg-caramel border-white"
                }`}
              >
                {loc.profile?.avatar_url ? (
                  <img
                    src={loc.profile.avatar_url}
                    alt={name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  name.charAt(0)
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-1 ring-white ${
                    isStale ? "bg-amber-400" : "bg-sage animate-ping"
                  }`}
                ></span>
              </div>

              <div className="mt-1 px-2 py-0.5 rounded-md bg-white/95 border border-espresso-100 shadow-sm text-[10px] font-bold text-espresso whitespace-nowrap">
                {name.split(" ").slice(-1)[0]}
                {loc.distanceMeters && ` • ${formatDistance(loc.distanceMeters)}`}
              </div>
            </div>
          );
        })}

        {/* Selected Marker Callout */}
        {selectedMarker && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 bg-white p-3 rounded-xl shadow-xl border border-espresso-100 max-w-xs text-xs animate-in fade-in">
            {(() => {
              const selected = locations.find((l) => l.user_id === selectedMarker);
              if (!selected) return null;
              return (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-espresso">{selected.profile?.display_name}</span>
                    <button
                      onClick={() => setSelectedMarker(null)}
                      className="text-muted-gray hover:text-espresso"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-gray">
                    Trạng thái:{" "}
                    <span className="font-semibold text-espresso">
                      {isLocationStale(selected.updated_at)
                        ? "Vị trí đã lâu chưa cập nhật (Offline)"
                        : "Đang di chuyển tới quán"}
                    </span>
                  </p>
                  {selected.distanceMeters && (
                    <p className="text-[11px] text-muted-gray">
                      Khoảng cách còn:{" "}
                      <span className="font-bold text-caramel">
                        {formatDistance(selected.distanceMeters)}
                      </span>
                    </p>
                  )}
                  {selected.etaMinutes && (
                    <p className="text-[11px] text-muted-gray">
                      Dự kiến tới (ETA):{" "}
                      <span className="font-bold text-sage">~{selected.etaMinutes} phút</span>
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Map Legend & Privacy Notice */}
      <div className="px-5 py-2.5 bg-cream-50 border-t border-espresso-100 text-[11px] text-muted-gray flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-espresso"></span>
            <span>Quán cà phê</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-caramel"></span>
            <span>Bạn bè đang đi</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sage"></span>
            <span>Vòng check-in (100m)</span>
          </span>
        </div>
        <span className="text-[10px] text-muted-gray">
          Chỉ các thành viên đã tham gia kèo này mới nhìn thấy vị trí của nhau
        </span>
      </div>
    </div>
  );
}
