"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  Medal,
  Flame,
  ShieldCheck,
  Ghost,
  Sparkles,
  Lock,
  Clock,
  Coffee,
} from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { Profile, FriendGroup, Badge } from "@/types/database";
import { calculateLevelFromXp } from "@/lib/reputation";

export default function GroupLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [group, setGroup] = useState<FriendGroup | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "month" | "week">("all");
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

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

      const data = dataStore.getGroupLeaderboard(groupId, user.id);
      setLeaderboardData(data);
    }
  }, [groupId, router]);

  if (!group || !currentUser) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-caramel border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xs text-muted-gray">Đang tải bảng xếp hạng nhóm...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <Link
        href={`/groups/${groupId}`}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-gray hover:text-espresso transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại nhóm {group.name}</span>
      </Link>

      {/* Header */}
      <div className="coffee-card p-6 sm:p-8 border border-espresso-100 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Nội bộ nhóm {group.name}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
            Bảng xếp hạng bạn bè
          </h1>
          <p className="text-xs text-muted-gray mt-1 max-w-lg leading-relaxed">
            Thành tích vui vẻ giữa các bạn trong nhóm: Điểm uy tín cam kết, XP lên cấp, streak đúng giờ và các huy hiệu đặc biệt.
          </p>
        </div>

        {/* Time Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-cream-100 border border-cream-200">
          <button
            onClick={() => setActiveTab("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "week"
                ? "bg-white text-espresso shadow-xs"
                : "text-muted-gray hover:text-espresso"
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "month"
                ? "bg-white text-espresso shadow-xs"
                : "text-muted-gray hover:text-espresso"
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-white text-espresso shadow-xs"
                : "text-muted-gray hover:text-espresso"
            }`}
          >
            Mọi thời đại
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="coffee-card overflow-hidden border border-espresso-100 bg-white shadow-sm">
        <div className="divide-y divide-espresso-100">
          {leaderboardData.map((item, index) => {
            const profile = item.profile;
            const levelInfo = calculateLevelFromXp(item.xp_total);
            const isFlakeKing = item.badges.some((b: Badge) => b.code === "flake_king");
            const isUser = profile.id === currentUser.id;

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                  isUser ? "bg-cream-50/70" : "hover:bg-cream-50/40"
                }`}
              >
                {/* Rank & Profile */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-7 text-center">
                    {index === 0 ? (
                      <span className="text-xl">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-xl">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-xs font-bold text-muted-gray">{index + 1}</span>
                    )}
                  </div>

                  <img
                    src={profile.avatar_url || ""}
                    alt={profile.display_name}
                    className="w-10 h-10 rounded-full object-cover border border-espresso-100"
                  />

                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/groups/${groupId}/members/${profile.id}`}
                        className="font-bold text-xs sm:text-sm text-espresso hover:text-caramel transition-colors"
                      >
                        {profile.display_name}
                      </Link>
                      {isUser && (
                        <span className="text-[10px] font-bold text-caramel px-1.5 py-0.2 bg-caramel-100 rounded">
                          Bạn
                        </span>
                      )}
                      {isFlakeKing && (
                        <span
                          title="Huy hiệu Chúa tể bùng kèo: Từng có 3 lần xác nhận không đến"
                          className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center space-x-1"
                        >
                          <Ghost className="w-3 h-3 text-red-600" />
                          <span>Chúa tể bùng kèo</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-muted-gray mt-0.5">
                      <span className="text-caramel font-semibold">Cấp {levelInfo.level} ({levelInfo.title})</span>
                      <span>•</span>
                      <span>{item.xp_total} XP</span>
                    </div>
                  </div>
                </div>

                {/* Badges & Stats */}
                <div className="flex items-center space-x-6 text-right">
                  {item.streak_count > 0 && (
                    <div className="hidden sm:flex items-center space-x-1 text-xs font-bold text-orange-600">
                      <Flame className="w-4 h-4 fill-current text-orange-500" />
                      <span>{item.streak_count} streak</span>
                    </div>
                  )}

                  <div>
                    <div className="text-sm sm:text-base font-black text-espresso">
                      {item.reputation_score}đ
                    </div>
                    <div className="text-[10px] text-muted-gray font-medium">Điểm uy tín</div>
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
