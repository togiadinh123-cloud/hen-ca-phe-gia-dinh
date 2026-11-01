"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  Calendar,
  Trophy,
  Share2,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Shield,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { FriendGroup, Profile, EventModel, GroupMember } from "@/types/database";
import { formatVietnameseDateTime } from "@/lib/time";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [group, setGroup] = useState<FriendGroup | null>(null);
  const [membership, setMembership] = useState<GroupMember | null>(null);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [members, setMembers] = useState<{ member: GroupMember; profile: Profile }[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState<{ token: string; inviteCode: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const res = dataStore.getGroupById(groupId, user.id);
      if (!res) {
        // Not a member or group doesn't exist
        router.push("/groups");
        return;
      }
      setGroup(res.group);
      setMembership(res.membership);

      const groupEvents = dataStore.getGroupEvents(groupId, user.id);
      setEvents(groupEvents);

      const groupMembersList = dataStore.groupMembers
        .filter((m) => m.group_id === groupId && m.membership_status === "active")
        .map((m) => ({
          member: m,
          profile: dataStore.profiles.find((p) => p.id === m.user_id)!,
        }))
        .filter((item) => Boolean(item.profile));

      setMembers(groupMembersList);
    }
  }, [groupId, router]);

  const handleOpenInvite = () => {
    if (!currentUser || !group) return;
    const inv = dataStore.createInvitation(group.id, currentUser.id);
    setInviteData(inv);
    setShowInviteModal(true);
  };

  const handleCopyInvite = () => {
    if (!inviteData) return;
    const fullUrl = `${window.location.origin}${inviteData.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!group || !currentUser) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-caramel border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xs text-muted-gray">Đang tải thông tin nhóm...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Group Header Card */}
      <div className="coffee-card overflow-hidden border border-espresso-100 shadow-md bg-white mb-8">
        <div className="h-40 sm:h-52 w-full relative bg-espresso-700">
          <img
            src={group.cover_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000"}
            alt={group.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-sage" />
              <span>Nhóm bạn riêng tư</span>
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
              {group.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-gray mt-1 max-w-2xl leading-relaxed">
              {group.description || "Nhóm bạn cùng hẹn hò cà phê cuối tuần."}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-gray">
              <span className="flex items-center space-x-1 font-medium text-espresso">
                <Users className="w-4 h-4 text-caramel" />
                <span>{members.length} bạn bè</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-sage font-medium">
                <Calendar className="w-4 h-4" />
                <span>{events.length} kèo cà phê</span>
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-cream-200 text-espresso text-[11px] font-semibold">
                Vai trò của bạn: {membership?.role === "owner" ? "Chủ nhóm" : membership?.role === "admin" ? "Quản trị" : "Thành viên"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenInvite}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-espresso-200 hover:border-caramel bg-white text-espresso font-bold text-xs transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4 text-caramel" />
              <span>Mời bạn bè</span>
            </button>

            <Link
              href={`/groups/${group.id}/leaderboard`}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Bảng xếp hạng nhóm</span>
            </Link>

            <Link
              href={`/groups/${group.id}/events/create`}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-espresso hover:bg-caramel text-white font-bold text-xs transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo kèo mới</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Events on left, Members on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Events Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-espresso flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-caramel" />
              <span>Các kèo cà phê của nhóm</span>
            </h2>

            <span className="text-xs text-muted-gray">{events.length} kèo</span>
          </div>

          {events.length === 0 ? (
            <div className="coffee-card p-10 text-center bg-white border border-dashed border-espresso-200">
              <Calendar className="w-10 h-10 text-muted-gray mx-auto mb-2" />
              <h3 className="font-bold text-espresso text-sm">Chưa có kèo cà phê nào</h3>
              <p className="text-xs text-muted-gray mt-1">
                Hãy là người đầu tiên lên kèo rủ bạn bè đi cà phê nhé!
              </p>
              <div className="mt-4">
                <Link
                  href={`/groups/${group.id}/events/create`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-espresso text-white text-xs font-bold hover:bg-caramel transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lên kèo ngay</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const isUserParticipant = event.participants?.some(
                  (p) => p.user_id === currentUser.id
                );
                const participantCount = event.participants?.length || 0;

                return (
                  <Link
                    key={event.id}
                    href={`/groups/${group.id}/events/${event.id}`}
                    className="coffee-card coffee-card-hover block p-5 border border-espresso-100 group bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        {/* Status Pills */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cream-200 text-espresso-700">
                            {event.area_label || event.city}
                          </span>

                          {event.venue_poll_status === "closed" && event.selected_place ? (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-sage" />
                              <span>Đã chốt quán</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Đang bình chọn quán
                            </span>
                          )}

                          {isUserParticipant && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Bạn đã tham gia
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-base sm:text-lg font-bold text-espresso group-hover:text-caramel transition-colors">
                          {event.title}
                        </h3>

                        {event.description && (
                          <p className="text-xs text-muted-gray line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Venue details if locked */}
                        {event.selected_place && (
                          <div className="flex items-center space-x-1.5 text-xs text-espresso-700 font-semibold pt-1">
                            <MapPin className="w-3.5 h-3.5 text-caramel flex-shrink-0" />
                            <span>{event.selected_place.place_name}</span>
                            <span className="text-muted-gray font-normal">• {event.selected_place.formatted_address}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Meta Column */}
                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-espresso-100">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-espresso">
                          <Clock className="w-4 h-4 text-caramel" />
                          <span>{formatVietnameseDateTime(event.starts_at)}</span>
                        </div>

                        <div className="text-xs text-muted-gray mt-1">
                          <span className="font-bold text-espresso">{participantCount}</span>
                          <span>/{event.capacity} chỗ</span>
                        </div>

                        <div className="mt-3 flex items-center space-x-1 text-xs font-bold text-caramel group-hover:translate-x-1 transition-transform">
                          <span>Chi tiết kèo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Members Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="coffee-card p-5 border border-espresso-100 bg-white shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-espresso-100 mb-4">
              <h3 className="font-bold text-espresso text-sm flex items-center space-x-2">
                <Users className="w-4 h-4 text-caramel" />
                <span>Thành viên trong nhóm</span>
              </h3>
              <span className="text-xs text-muted-gray">{members.length} người</span>
            </div>

            <div className="space-y-3">
              {members.map(({ member, profile }) => {
                const stat = dataStore.stats.find(
                  (s) => s.group_id === groupId && s.user_id === profile.id
                );

                return (
                  <Link
                    key={member.id}
                    href={`/groups/${groupId}/members/${profile.id}`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-cream-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={profile.avatar_url || ""}
                        alt={profile.display_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs text-espresso group-hover:text-caramel transition-colors">
                          {profile.display_name}
                        </div>
                        <div className="text-[10px] text-muted-gray">
                          {member.role === "owner"
                            ? "Chủ nhóm"
                            : member.role === "admin"
                            ? "Quản trị viên"
                            : "Thành viên"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-sage">
                        {stat?.reputation_score || 100}đ
                      </div>
                      <div className="text-[10px] text-muted-gray">Uy tín</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Friends Modal */}
      {showInviteModal && inviteData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="coffee-card p-6 bg-white max-w-md w-full rounded-2xl shadow-2xl border border-espresso-100">
            <div className="flex items-center justify-between pb-3 border-b border-espresso-100 mb-4">
              <h3 className="font-bold text-espresso text-base flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-caramel" />
                <span>Mời bạn bè vào nhóm</span>
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-muted-gray hover:text-espresso font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-gray leading-relaxed mb-4">
              Gửi liên kết này cho bạn bè thân thiết. Sau khi mở link, bạn bè sẽ trở thành thành viên nhóm và cùng tham gia các kèo cà phê!
            </p>

            <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 mb-4">
              <div className="text-[11px] font-bold text-muted-gray mb-1">Mã mời nhóm:</div>
              <div className="font-mono font-bold text-sm text-espresso">{inviteData.inviteCode}</div>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <input
                type="text"
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}${inviteData.url}`}
                className="flex-1 px-3 py-2 rounded-xl border border-espresso-200 bg-gray-50 text-xs font-mono text-espresso focus:outline-none"
              />
              <button
                onClick={handleCopyInvite}
                className="px-4 py-2 rounded-xl bg-caramel hover:bg-caramel-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors whitespace-nowrap"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Đã chép" : "Sao chép link"}</span>
              </button>
            </div>

            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full py-2.5 rounded-xl bg-espresso hover:bg-espresso-800 text-white font-bold text-xs transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
