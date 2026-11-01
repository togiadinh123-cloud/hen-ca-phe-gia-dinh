"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Shield, Trophy, Coffee, Calendar, Settings, Lock } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { Profile, FriendGroup, GroupMemberStats } from "@/types/database";
import { calculateLevelFromXp } from "@/lib/reputation";

export default function MyProfilePage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [userGroups, setUserGroups] = useState<FriendGroup[]>([]);
  const [userStats, setUserStats] = useState<GroupMemberStats[]>([]);

  useEffect(() => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const groups = dataStore.getUserGroups(user.id);
      setUserGroups(groups);

      const stats = dataStore.stats.filter((s) => s.user_id === user.id);
      setUserStats(stats);
    }
  }, []);

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="coffee-card p-6 sm:p-8 bg-white border border-espresso-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
        <img
          src={currentUser.avatar_url || ""}
          alt={currentUser.display_name}
          className="w-24 h-24 rounded-full object-cover border-4 border-cream-200 shadow-md"
        />

        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-espresso">{currentUser.display_name}</h1>
              <p className="text-xs text-caramel font-semibold">@{currentUser.username}</p>
            </div>

            <Link
              href="/settings/privacy"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-espresso-200 text-xs font-semibold text-espresso hover:bg-cream-100 transition-colors mx-auto sm:mx-0"
            >
              <Settings className="w-3.5 h-3.5 text-caramel" />
              <span>Quyền riêng tư</span>
            </Link>
          </div>

          {currentUser.bio && (
            <p className="text-xs text-muted-gray leading-relaxed max-w-lg">
              {currentUser.bio}
            </p>
          )}

          {/* Coffee Preferences */}
          {currentUser.coffee_preferences && currentUser.coffee_preferences.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
              {currentUser.coffee_preferences.map((pref) => (
                <span
                  key={pref}
                  className="px-2.5 py-0.5 rounded-full bg-cream-200 text-espresso text-[11px] font-medium"
                >
                  ☕ {pref}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gamification per Group (Explicitly Isolated per Section 7) */}
      <div className="coffee-card p-6 bg-white border border-espresso-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-espresso-100">
          <Trophy className="w-5 h-5 text-caramel" />
          <h2 className="text-base font-black text-espresso">
            Điểm uy tín & Cấp độ riêng theo từng nhóm bạn
          </h2>
        </div>

        <p className="text-xs text-muted-gray leading-relaxed">
          Theo nguyên tắc bảo mật, điểm uy tín và XP của bạn không gộp chung toàn quốc mà được tính độc lập trong từng nhóm bạn thân để đảm bảo sự riêng tư.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {userGroups.map((group) => {
            const stat = userStats.find((s) => s.group_id === group.id);
            const score = stat?.reputation_score || 100;
            const xp = stat?.xp_total || 0;
            const levelInfo = calculateLevelFromXp(xp);

            return (
              <div
                key={group.id}
                className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-espresso">{group.name}</h3>
                  <Link
                    href={`/groups/${group.id}`}
                    className="text-[11px] font-bold text-caramel hover:underline"
                  >
                    Vào nhóm →
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white border border-espresso-100">
                    <div className="text-base font-black text-sage">{score}đ</div>
                    <div className="text-[10px] text-muted-gray">Uy tín</div>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-espresso-100">
                    <div className="text-base font-black text-caramel">{xp} XP</div>
                    <div className="text-[10px] text-muted-gray">Kinh nghiệm</div>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-espresso-100">
                    <div className="text-base font-black text-espresso">Cấp {levelInfo.level}</div>
                    <div className="text-[10px] text-muted-gray truncate">{levelInfo.title}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
