"use client";

import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, QrCode, AlertCircle, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import { EventModel, EventPlace, Profile } from "@/types/database";
import { dataStore } from "@/lib/data-store";
import { verifySignedQrToken } from "@/lib/qr-security";

interface ParticipantQrScannerProps {
  event: EventModel;
  currentUser: Profile;
  venue: EventPlace | null | undefined;
  onSuccess: (message: string) => void;
  onClose: () => void;
}

export default function ParticipantQrScanner({
  event,
  currentUser,
  venue,
  onSuccess,
  onClose,
}: ParticipantQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [scanning, setScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>("Đang lấy tọa độ GPS của bạn...");
  const [userCoord, setUserCoord] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showHelpRequest, setShowHelpRequest] = useState(false);
  const [helpReason, setHelpReason] = useState("");
  const [helpSent, setHelpSent] = useState(false);

  // Initialize GPS verification
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoord({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setGpsStatus(`GPS hợp lệ (Sai số ±${Math.round(pos.coords.accuracy)}m)`);
        },
        (err) => {
          setGpsStatus(`Chưa lấy được GPS: ${err.message}. Sử dụng tọa độ giả lập cho thử nghiệm.`);
          setUserCoord({
            lat: venue?.latitude || 10.7743,
            lng: venue?.longitude || 106.7048,
            accuracy: 15,
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserCoord({
        lat: venue?.latitude || 10.7743,
        lng: venue?.longitude || 106.7048,
        accuracy: 20,
      });
    }
  }, [venue]);

  // Initialize Camera Scanner
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    let isMounted = true;

    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, error) => {
        if (!isMounted) return;
        if (result) {
          const text = result.getText();
          handleScannedToken(text);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setCameraError(
            "Không thể truy cập camera trình duyệt. Bạn có thể nhập mã xác nhận hoặc dùng mã QR từ chủ kèo."
          );
        }
      });

    return () => {
      isMounted = false;
      try {
        // Stop scanning
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // Ignore cleanup error
      }
    };
  }, []);

  const handleScannedToken = (token: string) => {
    if (processing) return;
    setProcessing(true);

    const lat = userCoord?.lat || venue?.latitude || 10.7743;
    const lng = userCoord?.lng || venue?.longitude || 106.7048;
    const accuracy = userCoord?.accuracy || 15;

    // Verify token signature & expiry
    const verification = verifySignedQrToken(token);
    if (!verification.isValid) {
      alert(verification.error || "Mã QR không hợp lệ hoặc đã hết hạn.");
      setProcessing(false);
      return;
    }

    // Process checkin at server/store
    const res = dataStore.processCheckin(
      event.id,
      currentUser.id,
      token,
      lat,
      lng,
      accuracy
    );

    if (res.success) {
      onSuccess(res.message);
      onClose();
    } else {
      alert(res.message);
      setProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScannedToken(manualCode.trim());
  };

  const handleSendHelpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Record manual review appeal
    dataStore.appeals.push({
      id: `appeal_${Date.now()}`,
      group_id: event.group_id,
      event_id: event.id,
      user_id: currentUser.id,
      reason: helpReason || "Lỗi camera hoặc định vị GPS tại quán",
      status: "pending",
      reviewed_by: null,
      review_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setHelpSent(true);
  };

  // For testing: Grab active token from host session if available
  const activeSession = dataStore.getActiveCheckinSession(event.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="coffee-card p-6 bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-espresso-100">
        <div className="flex items-center justify-between pb-3 border-b border-espresso-100 mb-4">
          <div className="flex items-center space-x-2 text-espresso font-black text-base">
            <Camera className="w-5 h-5 text-caramel" />
            <span>Quét QR Check-in</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-gray hover:text-espresso font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {!showHelpRequest ? (
          <div className="space-y-4">
            {/* Camera Viewport */}
            <div className="relative w-full h-56 bg-black rounded-2xl overflow-hidden border-2 border-espresso-200 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Target scanner bounding box */}
              <div className="absolute inset-8 border-2 border-caramel/80 rounded-xl pointer-events-none animate-pulse"></div>

              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center text-white text-xs space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                  <p>{cameraError}</p>
                </div>
              )}
            </div>

            {/* GPS Proximity Status */}
            <div className="p-2.5 rounded-xl bg-cream-100 border border-cream-200 text-[11px] text-espresso-700 space-y-1">
              <div className="flex items-center space-x-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                <span>Kiểm tra tọa độ &lt; 100m quanh {venue?.place_name}</span>
              </div>
              <p className="text-[10px] text-muted-gray">{gpsStatus}</p>
            </div>

            {/* Manual token input / Demo shortcut */}
            {activeSession && (
              <div className="pt-2 border-t border-espresso-100">
                <button
                  type="button"
                  onClick={() => handleScannedToken(activeSession.token)}
                  disabled={processing}
                  className="w-full py-2 rounded-xl bg-cream-200 hover:bg-caramel hover:text-white text-espresso text-xs font-bold transition-colors"
                >
                  ⚡ Nhận mã check-in từ chủ kèo (Thử nghiệm nhanh)
                </button>
              </div>
            )}

            {/* Help request button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowHelpRequest(true)}
                className="text-[11px] text-caramel hover:underline font-semibold flex items-center justify-center space-x-1 mx-auto"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Gặp sự cố camera hoặc GPS? Yêu cầu hỗ trợ</span>
              </button>
            </div>
          </div>
        ) : (
          /* Manual Review / Help Flow */
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-espresso">
              Yêu cầu hỗ trợ xác nhận check-in
            </h4>
            <p className="text-xs text-muted-gray leading-relaxed">
              Nếu camera bị lỗi hoặc GPS trong nhà không định vị được, bạn có thể gửi yêu cầu để chủ kèo duyệt thủ công mà không bị tính bùng kèo.
            </p>

            {helpSent ? (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-sage mx-auto" />
                <p className="font-bold">Đã gửi yêu cầu hỗ trợ thành công!</p>
                <p className="text-[11px] text-muted-gray">
                  Chủ kèo sẽ xem xét và xác nhận có mặt cho bạn.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-espresso text-white text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendHelpRequest} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={helpReason}
                  onChange={(e) => setHelpReason(e.target.value)}
                  placeholder="Mô tả sự cố (vd: GPS trong tòa nhà chập chờn, camera không bật được...)"
                  className="w-full p-2.5 rounded-xl border border-espresso-200 text-xs focus:outline-none focus:ring-1 focus:ring-caramel"
                />

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowHelpRequest(false)}
                    className="w-1/2 py-2 rounded-xl border border-espresso-200 text-xs font-bold text-espresso"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 rounded-xl bg-espresso hover:bg-caramel text-white text-xs font-bold transition-colors"
                  >
                    Gửi yêu cầu
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
