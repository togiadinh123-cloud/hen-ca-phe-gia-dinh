"use client";

import { useState } from "react";
import { EventModel, EventPlace, Profile } from "@/types/database";
import { dataStore } from "@/lib/data-store";
import { Coffee, MapPin, Plus, CheckCircle2, ExternalLink, Lock } from "lucide-react";

interface VenueVotingProps {
  event: EventModel;
  currentUser: Profile;
  isParticipant: boolean;
  onUpdate: () => void;
}

export default function VenueVoting({
  event,
  currentUser,
  isParticipant,
  onUpdate,
}: VenueVotingProps) {
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("10.7743");
  const [lng, setLng] = useState("106.7048");
  const [proposeError, setProposeError] = useState<string | null>(null);

  const eventPlaces = dataStore.places.filter((p) => p.event_id === event.id);
  const eventVotes = dataStore.votes.filter((v) => v.event_id === event.id);
  const userVote = eventVotes.find((v) => v.user_id === currentUser.id);

  const totalVotes = eventVotes.length;
  const isPollOpen = event.venue_poll_status === "open";
  const isHost = event.host_id === currentUser.id;

  const handleVote = (placeId: string) => {
    if (!isParticipant) {
      alert("Bạn cần bấm 'Tham gia ngay' trước khi bình chọn quán.");
      return;
    }
    dataStore.votePlace(event.id, placeId, currentUser.id);
    onUpdate();
  };

  const handleClosePoll = () => {
    if (!confirm("Bạn có chắc chắn muốn chốt bình chọn ngay bây giờ không? Quán có số phiếu cao nhất sẽ được chọn.")) {
      return;
    }
    const res = dataStore.closeVenuePoll(event.id, currentUser.id);
    if (res.success) {
      onUpdate();
    } else {
      alert(res.message);
    }
  };

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    setProposeError(null);

    const res = dataStore.proposePlace(event.id, currentUser.id, {
      google_place_id: `place_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      place_name: placeName.trim(),
      formatted_address: address.trim(),
      latitude: parseFloat(lat) || 10.7743,
      longitude: parseFloat(lng) || 106.7048,
    });

    if (res.success) {
      setShowProposeModal(false);
      setPlaceName("");
      setAddress("");
      onUpdate();
    } else {
      setProposeError(res.message);
    }
  };

  return (
    <div className="coffee-card p-6 bg-white border border-espresso-100 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-espresso-100">
        <div>
          <div className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 text-caramel" />
            <h3 className="text-base font-black text-espresso">Bình chọn quán cà phê</h3>
            {isPollOpen ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Đang mở bình chọn
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-sage" />
                <span>Đã chốt quán</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-gray mt-1">
            {isPollOpen
              ? "Mỗi thành viên tham gia có 1 phiếu và có thể đổi phiếu trước hạn đóng."
              : "Bình chọn đã hoàn tất và quán chính thức đã được khóa."}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isParticipant && isPollOpen && (
            <button
              onClick={() => setShowProposeModal(true)}
              className="px-3 py-1.5 rounded-xl border border-espresso-200 hover:border-caramel bg-white text-xs font-bold text-espresso flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-caramel" />
              <span>Đề xuất quán</span>
            </button>
          )}

          {isHost && isPollOpen && eventPlaces.length > 0 && (
            <button
              onClick={handleClosePoll}
              className="px-3 py-1.5 rounded-xl bg-espresso hover:bg-caramel text-white text-xs font-bold transition-colors shadow-sm"
            >
              Chốt quán ngay
            </button>
          )}
        </div>
      </div>

      {/* Places List */}
      {eventPlaces.length === 0 ? (
        <div className="py-8 text-center bg-cream-50 rounded-xl border border-dashed border-espresso-200">
          <MapPin className="w-8 h-8 text-muted-gray mx-auto mb-2" />
          <p className="text-xs font-bold text-espresso">Chưa có quán nào được đề xuất</p>
          <p className="text-[11px] text-muted-gray mt-0.5">
            Các thành viên tham gia kèo có thể bấm nút đề xuất quán ở trên.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventPlaces.map((place) => {
            const votesForThis = eventVotes.filter((v) => v.place_id === place.id).length;
            const percentage = totalVotes > 0 ? Math.round((votesForThis / totalVotes) * 100) : 0;
            const isSelected = event.selected_place_id === place.id;
            const isUserVotedThis = userVote?.place_id === place.id;

            return (
              <div
                key={place.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-sage-50/60 border-sage shadow-sm"
                    : isUserVotedThis
                    ? "bg-cream-50 border-caramel shadow-sm"
                    : "bg-white border-espresso-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-espresso">{place.place_name}</h4>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage text-white flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Quán đã chốt</span>
                        </span>
                      )}
                      {isUserVotedThis && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-caramel-100 text-caramel-800">
                          Phiếu của bạn
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-gray leading-relaxed flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-caramel flex-shrink-0" />
                      <span>{place.formatted_address}</span>
                    </p>
                  </div>

                  {/* Actions & Vote button */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-espresso">{votesForThis} phiếu</div>
                      <div className="text-[10px] text-muted-gray">{percentage}%</div>
                    </div>

                    {isPollOpen && isParticipant && (
                      <button
                        onClick={() => handleVote(place.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isUserVotedThis
                            ? "bg-caramel text-white"
                            : "bg-espresso-50 hover:bg-caramel hover:text-white text-espresso"
                        }`}
                      >
                        {isUserVotedThis ? "Đã chọn" : "Bình chọn"}
                      </button>
                    )}

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${place.place_name} ${place.formatted_address}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-espresso-200 hover:border-caramel text-muted-gray hover:text-espresso transition-colors"
                      title="Mở Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-espresso-100 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isSelected ? "bg-sage" : isUserVotedThis ? "bg-caramel" : "bg-espresso-400"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Venue Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="coffee-card p-6 bg-white max-w-md w-full rounded-2xl shadow-2xl border border-espresso-100">
            <div className="flex items-center justify-between pb-3 border-b border-espresso-100 mb-4">
              <h3 className="font-bold text-espresso text-base flex items-center space-x-2">
                <Coffee className="w-5 h-5 text-caramel" />
                <span>Đề xuất quán cà phê</span>
              </h3>
              <button
                onClick={() => setShowProposeModal(false)}
                className="text-muted-gray hover:text-espresso font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {proposeError && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs">
                {proposeError}
              </div>
            )}

            <form onSubmit={handlePropose} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-espresso mb-1">
                  Tên quán cà phê <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="Ví dụ: Okkio Caffe, Dabao Concept, Cheese Coffee..."
                  className="w-full px-3.5 py-2 rounded-xl border border-espresso-200 text-xs focus:outline-none focus:ring-2 focus:ring-caramel"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso mb-1">
                  Địa chỉ quán <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường, quận"
                  className="w-full px-3.5 py-2 rounded-xl border border-espresso-200 text-xs focus:outline-none focus:ring-2 focus:ring-caramel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-gray mb-1">Vĩ độ (Lat)</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-espresso-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-gray mb-1">Kinh độ (Lng)</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-espresso-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-espresso-200 text-xs font-bold text-espresso hover:bg-cream-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-espresso hover:bg-caramel text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Thêm đề xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
