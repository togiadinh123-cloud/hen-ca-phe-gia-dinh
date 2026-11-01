"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Flame, ShieldCheck, Ghost, Coffee, Clock, Compass, Sparkles } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { Profile, FriendGroup, GroupMemberStats, Badge } from "@/types/database";
import { calculateLevelFromXp } from "@/lib/reputation";

export default function GroupMemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const targetUserId = params.userId as string;

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [group, setGroup] = useState<FriendGroup | null>(null);
  const [stats, setStats] = useState<GroupMemberStats | null>(null);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const res = dataStore.getGroupById(groupId, user.id);
      if (!res) {
        router.push("/groups");
        return;
      }
      setGroup(res.group);

      const profile = dataStore.profiles.find((p) => p.id === targetUserId);
      if (!profile) {
        router.push(`/groups/${groupId}`);
        return;
      }
      setTargetProfile(profile);

      const st = dataStore.stats.find(
        (s) => s.group_id === groupId && s.user_id === targetUserId
      );
      setStats(st || null);

      const badges = dataStore.userBadges
        .filter((ub) => ub.group_id === groupId && ub.user_id === targetUserId)
        .map((ub) => dataStore.badges.find((b) => b.id === ub.badge_id))
        .filter(Boolean) as Badge[];
      setUserBadges(badges);
    }
  }, [groupId, targetUserId, router]);

  if (!group || !targetProfile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-caramel border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xs text-muted-gray">Đang tải thông tin thành viên...</p>
      </div>
    );
  }

  const levelInfo = calculateLevelFromXp(stats?.xp_total || 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        href={`/groups/${groupId}`}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-gray hover:text-espresso transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại nhóm {group.name}</span>
      </Link>

      {/* Profile Header */}
      <div className="coffee-card p-6 sm:p-8 bg-white border border-espresso-100 shadow-sm text-center">
        <img
          src={targetProfile.avatar_url || ""}
          alt={targetProfile.display_name}
          className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-caramel shadow-md"
        />

        <h1 className="text-2xl font-black text-espresso">{targetProfile.display_name}</h1>
        <p className="text-xs text-caramel font-semibold">@{targetProfile.username}</p>

        {targetProfile.bio && (
          <p className="text-xs text-muted-gray mt-2 max-w-sm mx-auto leading-relaxed">
            {targetProfile.bio}
          </p>
        )}

        {/* Level and Reputation Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-espresso-100">
          <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
            <div className="text-lg font-black text-sage">{stats?.reputation_score || 100}đ</div>
            <div className="text-[10px] text-muted-gray uppercase font-bold">Uy tín nhóm</div>
          </div>

          <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
            <div className="text-lg font-black text-caramel">{stats?.xp_total || 0} XP</div>
            <div className="text-[10px] text-muted-gray uppercase font-bold">
              Cấp {levelInfo.level} ({levelInfo.title})
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
            <div className="text-lg font-black text-orange-600 flex items-center justify-center space-x-1">
              <Flame className="w-4 h-4 fill-current text-orange-500" />
              <span>{stats?.streak_count || 0}</span>
            </div>
            <div className="text-[10px] text-muted-gray uppercase font-bold">Streak đúng giờ</div>
          </div>
        </div>
      </div>

      {/* Badges in this group */}
      <div className="coffee-card p-6 bg-white border border-espresso-100 shadow-sm space-y-4">
        <h3 className="font-bold text-espresso text-sm flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-caramel" />
          <span>Huy hiệu trong nhóm {group.name}</span>
        </h3>

        {userBadges.length === 0 ? (
          <p className="text-xs text-muted-gray italic">Chưa có huy hiệu nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userBadges.map((badge) => {
              const isFlakeKing = badge.code === "flake_king";
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    isFlakeKing
                      ? "bg-red-50/70 border-red-200 text-red-800"
                      : "bg-cream-50 border-cream-200 text-espresso"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isFlakeKing ? "bg-red-200 text-red-700" : "bg-caramel text-white"
                    }`}
                  >
                    {isFlakeKing ? <Ghost className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{badge.name}</h4>
                    <p className="text-[11px] opacity-80 leading-relaxed mt-0.5">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
