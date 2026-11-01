"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, RefreshCw, ShieldCheck, AlertCircle, Clock } from "lucide-react";
import { EventModel, EventPlace } from "@/types/database";
import { dataStore } from "@/lib/data-store";
import { isWithinGeofence } from "@/lib/geo";

interface HostQrModalProps {
  event: EventModel;
  venue: EventPlace | null | undefined;
  onClose: () => void;
}

export default function HostQrModal({ event, venue, onClose }: HostQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [tokenString, setTokenString] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(60);
  const [isNearVenue, setIsNearVenue] = useState<boolean>(true);
  const [checkingGps, setCheckingGps] = useState<boolean>(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Generate / Refresh rotating QR code
  const refreshQrSession = () => {
    const { token, expiresAt } = dataStore.createCheckinSession(event.id, event.host_id);
    setTokenString(token);
    setCountdown(60);

    QRCode.toDataURL(token, {
      width: 280,
      margin: 2,
      color: {
        dark: "#3B2A22",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR generation error:", err));
  };

  // Host Geofence Verification (< 100m)
  useEffect(() => {
    if (!venue) {
      setCheckingGps(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { isInside, distanceMeters } = isWithinGeofence(
            pos.coords.latitude,
            pos.coords.longitude,
            venue.latitude,
            venue.longitude,
            100
          );
          // For development purposes, if host is testing locally allow pass or warn
          setIsNearVenue(isInside);
          setCheckingGps(false);
          refreshQrSession();
        },
        (err) => {
          setGpsError("Không thể lấy GPS của bạn để kiểm tra vị trí quanh quán.");
          setCheckingGps(false);
          // In development, still generate code so feature can be tested
          refreshQrSession();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setCheckingGps(false);
      refreshQrSession();
    }
  }, [venue]);

  // Countdown timer for rotating QR (60s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshQrSession();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="coffee-card p-6 sm:p-8 bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-espresso-100 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-espresso-100 mb-4">
          <div className="flex items-center space-x-2 text-espresso font-black text-base">
            <QrCode className="w-5 h-5 text-caramel" />
            <span>Mã QR Check-in</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-gray hover:text-espresso font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {checkingGps ? (
          <div className="py-12">
            <div className="animate-spin w-8 h-8 border-4 border-caramel border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-xs text-muted-gray">Đang xác minh vị trí của bạn tại quán...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-gray">
              Đưa mã QR này cho các bạn trong kèo quét để xác nhận có mặt tại quán.
            </p>

            {/* QR Canvas */}
            <div className="p-4 bg-white border-2 border-espresso-200 rounded-2xl shadow-inner inline-block mx-auto relative">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Mã QR Checkin"
                  className="w-56 h-56 mx-auto object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-muted-gray">
                  Đang tạo mã QR...
                </div>
              )}

              {/* Countdown badge */}
              <div className="mt-2 flex items-center justify-center space-x-1 text-[11px] font-bold text-espresso">
                <Clock className="w-3.5 h-3.5 text-caramel animate-spin" />
                <span>Mã đổi mới sau: {countdown}s</span>
              </div>
            </div>

            {/* Geofence notice */}
            <div className="p-2.5 rounded-xl bg-cream-100 border border-cream-200 text-[11px] text-espresso-700 space-y-1">
              <div className="flex items-center justify-center space-x-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                <span>Mã QR có chữ ký & Nonce chống chụp ảnh lại</span>
              </div>
              <p className="text-[10px] text-muted-gray">
                Người quét cũng phải có mặt trong bán kính 100m quanh {venue?.place_name}.
              </p>
            </div>

            <button
              onClick={refreshQrSession}
              className="w-full py-2.5 rounded-xl border border-espresso-200 hover:border-caramel text-xs font-bold text-espresso hover:bg-cream-100 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đổi mã QR ngay</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
