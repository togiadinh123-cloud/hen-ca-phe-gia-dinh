"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Coffee,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Navigation,
  QrCode,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  XCircle,
} from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { EventModel, Profile, LiveLocation } from "@/types/database";
import { formatVietnameseDateTime, isCancellationDeadlinePassed, isCheckinWindowOpen } from "@/lib/time";
import VenueVoting from "@/components/voting/VenueVoting";
import GoogleMapView from "@/components/maps/GoogleMapView";
import LiveTracker from "@/components/tracking/LiveTracker";
import HostQrModal from "@/components/checkin/HostQrModal";
import ParticipantQrScanner from "@/components/checkin/ParticipantQrScanner";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const eventId = params.eventId as string;

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [event, setEvent] = useState<EventModel | null>(null);
  const [liveLocations, setLiveLocations] = useState<LiveLocation[]>([]);
  const [showHostQr, setShowHostQr] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const evt = dataStore.getEventById(eventId, user.id);
      if (!evt) {
        router.push(`/groups/${groupId}`);
        return;
      }
      setEvent(evt);

      // Hydrate live locations of fellow event participants
      const locs = dataStore.liveLocations
        .filter((l) => l.event_id === eventId)
        .map((l) => ({
          ...l,
          profile: dataStore.profiles.find((p) => p.id === l.user_id),
        }));
      setLiveLocations(locs);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupId, eventId, router]);

  if (!event || !currentUser) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-caramel border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xs text-muted-gray">Đang tải thông tin kèo cà phê...</p>
      </div>
    );
  }

  const isHost = event.host_id === currentUser.id;
  const participant = event.participants?.find((p) => p.user_id === currentUser.id);
  const isParticipant = Boolean(participant && participant.participant_status !== "cancelled");
  const isCheckedIn = participant?.participant_status === "checked_in";
  const venue = event.selected_place;
  const checkinWindow = isCheckinWindowOpen(event.starts_at);

  const handleJoin = () => {
    const res = dataStore.joinEvent(event.id, currentUser.id);
    if (res.success) {
      setToastMessage(res.message);
      loadData();
    } else {
      alert(res.message);
    }
  };

  const handleLeave = () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đăng ký tham gia kèo này không?")) return;
    const res = dataStore.leaveEvent(event.id, currentUser.id);
    setToastMessage(res.message);
    loadData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href={`/groups/${groupId}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-gray hover:text-espresso transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại nhóm</span>
        </Link>

        <div className="text-xs text-muted-gray font-medium">
          Kèo riêng trong: <strong className="text-espresso">Hội Bạn Cà Phê Cuối Tuần</strong>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-green-800 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Main Event Header Card */}
      <div className="coffee-card p-6 sm:p-8 border border-espresso-100 bg-white shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-cream-200 text-espresso-700">
                {event.area_label || event.city}
              </span>

              {event.venue_poll_status === "closed" && venue ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sage-100 text-sage-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                  <span>Đã chốt: {venue.place_name}</span>
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                  Đang bình chọn quán
                </span>
              )}

              {isCheckedIn && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-green-700" />
                  <span>Bạn đã Check-in (+3 điểm)</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
              {event.title}
            </h1>

            {event.description && (
              <p className="text-xs sm:text-sm text-muted-gray leading-relaxed max-w-2xl">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-gray">
              <span className="flex items-center space-x-1.5 font-bold text-espresso">
                <Clock className="w-4 h-4 text-caramel" />
                <span>{formatVietnameseDateTime(event.starts_at)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5 font-semibold text-espresso">
                <Users className="w-4 h-4 text-caramel" />
                <span>
                  {event.participants?.length || 0} / {event.capacity} người tham gia
                </span>
              </span>
              <span>•</span>
              <span>Host: <strong>{event.host?.display_name || "Bạn bè"}</strong></span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 min-w-[180px]">
            {!isParticipant ? (
              <button
                onClick={handleJoin}
                className="w-full py-3 px-5 rounded-xl bg-espresso hover:bg-caramel text-white font-bold text-xs transition-all shadow-md text-center"
              >
                Tham gia ngay (RSVP)
              </button>
            ) : (
              <>
                {/* Check-in CTA: Host opens QR vs Participant scans QR */}
                {isHost ? (
                  <button
                    onClick={() => setShowHostQr(true)}
                    className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-600 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Mở mã QR check-in</span>
                  </button>
                ) : (
                  !isCheckedIn && (
                    <button
                      onClick={() => setShowScanner(true)}
                      className="w-full py-3 px-4 rounded-xl bg-sage hover:bg-sage-600 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Quét QR check-in (+3đ)</span>
                    </button>
                  )
                )}

                {!isCheckedIn && !isHost && (
                  <button
                    onClick={handleLeave}
                    className="w-full py-2 px-3 rounded-xl border border-espresso-200 hover:border-red-300 hover:bg-red-50 text-espresso text-xs font-semibold transition-colors text-center"
                  >
                    Hủy tham gia / Rời kèo
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="pt-4 border-t border-espresso-100 flex flex-wrap gap-2">
            {event.tags.map((t) => (
              <span key={t} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-cream-100 text-espresso">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Left Column (Map & Tracking) | Right Column (Voting & Participants) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Map & Live Tracker */}
        <div className="lg:col-span-7 space-y-6">
          {/* Map Section */}
          <GoogleMapView
            venue={venue}
            locations={liveLocations}
            userLocation={null}
            onRefresh={loadData}
          />

          {/* Live GPS Tracker Controls (Only for joined participants) */}
          {isParticipant && !isCheckedIn && (
            <LiveTracker
              event={event}
              currentUser={currentUser}
              venue={venue}
              onLocationUpdate={loadData}
            />
          )}

          {/* Venue Voting Section */}
          <VenueVoting
            event={event}
            currentUser={currentUser}
            isParticipant={isParticipant}
            onUpdate={loadData}
          />
        </div>

        {/* Right Column (5 cols): Participants list */}
        <div className="lg:col-span-5 space-y-6">
          <div className="coffee-card p-6 bg-white border border-espresso-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-espresso-100">
              <h3 className="font-bold text-espresso text-sm flex items-center space-x-2">
                <Users className="w-4 h-4 text-caramel" />
                <span>Danh sách bạn bè tham gia</span>
              </h3>
              <span className="text-xs text-muted-gray">
                {event.participants?.length || 0}/{event.capacity}
              </span>
            </div>

            <div className="space-y-3">
              {event.participants?.map((p) => {
                const profile = p.profile;
                const isUser = p.user_id === currentUser.id;

                let statusBadge = (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                    Đã đăng ký
                  </span>
                );

                if (p.participant_status === "checked_in") {
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-sage" />
                      <span>Đã tới quán</span>
                    </span>
                  );
                } else if (p.participant_status === "traveling" || p.location_sharing_enabled) {
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-caramel-100 text-caramel-800 flex items-center space-x-1 animate-pulse">
                      <Navigation className="w-3 h-3" />
                      <span>Đang di chuyển</span>
                    </span>
                  );
                }

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      isUser ? "bg-cream-50 border-caramel-200" : "bg-white border-espresso-100"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={profile?.avatar_url || ""}
                        alt={profile?.display_name || ""}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs text-espresso flex items-center space-x-1.5">
                          <span>{profile?.display_name}</span>
                          {p.role === "host" && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-espresso text-cream">
                              HOST
                            </span>
                          )}
                          {isUser && (
                            <span className="text-[9px] font-semibold text-caramel">(Bạn)</span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-gray">@{profile?.username}</div>
                      </div>
                    </div>

                    <div>{statusBadge}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Host QR Modal */}
      {showHostQr && (
        <HostQrModal
          event={event}
          venue={venue}
          onClose={() => setShowHostQr(false)}
        />
      )}

      {/* Participant QR Scanner Modal */}
      {showScanner && (
        <ParticipantQrScanner
          event={event}
          currentUser={currentUser}
          venue={venue}
          onSuccess={(msg) => {
            setToastMessage(msg);
            loadData();
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
