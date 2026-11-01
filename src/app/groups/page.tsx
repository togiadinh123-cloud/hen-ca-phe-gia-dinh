"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Plus, Calendar, ArrowRight, Shield, Lock, Ticket } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { FriendGroup, Profile, EventModel } from "@/types/database";

export default function GroupsPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setGroups(dataStore.getUserGroups(user.id));
    }
  }, []);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setInviteError(null);
    setInviteSuccess(null);

    const res = dataStore.acceptInvitation(inviteCode, currentUser.id);
    if (res.success) {
      setInviteSuccess(res.message);
      setGroups(dataStore.getUserGroups(currentUser.id));
      setInviteCode("");
    } else {
      setInviteError(res.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cream-200 text-espresso-700 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5 text-caramel" />
            <span>Không gian riêng tư</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
            Nhóm bạn của tôi
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray mt-1">
            Chỉ bạn bè trong từng nhóm mới xem được kèo, bình chọn quán và vị trí di chuyển của nhau.
          </p>
        </div>

        <Link
          href="/groups/create"
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-espresso hover:bg-caramel text-white font-bold text-sm transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo nhóm bạn mới</span>
        </Link>
      </div>

      {/* Join with Invite Code / Token Banner */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-espresso-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center text-caramel flex-shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-espresso">Có mã mời từ bạn bè?</h3>
            <p className="text-xs text-muted-gray">Nhập mã mời hoặc liên kết để gia nhập nhóm bạn</p>
          </div>
        </div>

        <form onSubmit={handleJoinByCode} className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Nhập mã mời (vd: inv_123...)"
            className="flex-1 md:w-64 px-3.5 py-2 rounded-xl border border-espresso-200 text-xs focus:outline-none focus:ring-2 focus:ring-caramel"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-caramel hover:bg-caramel-600 text-white font-bold text-xs transition-colors whitespace-nowrap shadow-sm"
          >
            Vào nhóm
          </button>
        </form>
      </div>

      {inviteSuccess && (
        <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-medium">
          {inviteSuccess}
        </div>
      )}

      {inviteError && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {inviteError}
        </div>
      )}

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="coffee-card p-12 text-center bg-white border border-dashed border-espresso-200">
          <Users className="w-12 h-12 text-muted-gray mx-auto mb-3" />
          <h3 className="text-base font-bold text-espresso">Bạn chưa thuộc nhóm bạn nào</h3>
          <p className="text-xs text-muted-gray mt-1 max-w-sm mx-auto">
            Hãy tạo nhóm bạn mới hoặc nhờ bạn bè gửi mã mời để cùng lên lịch đi cà phê nhé!
          </p>
          <div className="mt-5">
            <Link
              href="/groups/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-espresso text-white text-xs font-bold hover:bg-caramel transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo nhóm ngay</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const memberCount = dataStore.groupMembers.filter(
              (m) => m.group_id === group.id && m.membership_status === "active"
            ).length;

            const upcomingEvents = dataStore.events.filter(
              (e) => e.group_id === group.id && e.event_status === "published"
            );

            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="coffee-card coffee-card-hover flex flex-col justify-between overflow-hidden border border-espresso-100 group"
              >
                {/* Cover Banner */}
                <div className="h-32 w-full relative overflow-hidden bg-espresso-700">
                  <img
                    src={group.cover_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600"}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-sage" />
                    <span>Riêng tư</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-espresso group-hover:text-caramel transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-xs text-muted-gray mt-1 line-clamp-2 leading-relaxed">
                      {group.description || "Nhóm bạn thân hẹn hò cà phê cuối tuần."}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="mt-5 pt-4 border-t border-espresso-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-muted-gray">
                      <Users className="w-3.5 h-3.5 text-caramel" />
                      <span className="font-semibold text-espresso">{memberCount}</span>
                      <span>thành viên</span>
                    </div>

                    <div className="flex items-center space-x-1 text-sage font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{upcomingEvents.length} kèo</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
