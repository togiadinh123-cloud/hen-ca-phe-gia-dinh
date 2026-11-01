"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Users, Calendar, CheckCircle2, AlertTriangle, FileText, Check, X } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { Profile, Appeal } from "@/types/database";

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    setAppeals([...dataStore.appeals]);
  }, []);

  if (!currentUser) return null;

  if (currentUser.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-espresso">Không có quyền truy cập</h1>
        <p className="text-xs text-muted-gray">
          Trang này chỉ dành cho tài khoản có vai trò Quản trị viên (Admin). Bạn có thể đổi sang tài khoản Admin ở menu trên cùng để thử nghiệm.
        </p>
        <Link
          href="/groups"
          className="inline-block px-4 py-2 rounded-xl bg-espresso text-white text-xs font-bold"
        >
          Quay lại Nhóm của tôi
        </Link>
      </div>
    );
  }

  const handleResolveAppeal = (appealId: string, status: "approved" | "rejected") => {
    const app = dataStore.appeals.find((a) => a.id === appealId);
    if (app) {
      app.status = status;
      app.reviewed_by = currentUser.id;
      app.review_notes = status === "approved" ? "Khiếu nại hợp lệ, đã hoàn điểm uy tín" : "Từ chối khiếu nại";
      app.updated_at = new Date().toISOString();

      if (status === "approved") {
        // Restore reputation score in group
        const stat = dataStore.stats.find(
          (s) => s.group_id === app.group_id && s.user_id === app.user_id
        );
        if (stat) {
          stat.reputation_score += 15; // Refund no-show penalty
        }
      }
      setAppeals([...dataStore.appeals]);
      setMessage(`Đã ${status === "approved" ? "chấp thuận" : "từ chối"} khiếu nại.`);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const totalUsers = dataStore.profiles.length;
  const totalEvents = dataStore.events.length;
  const totalCheckins = dataStore.checkins.length + 8; // demo total

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-espresso text-cream flex items-center justify-center">
          <Shield className="w-6 h-6 text-caramel" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-espresso">Quản trị Hệ thống (Admin)</h1>
          <p className="text-xs text-muted-gray">
            Giám sát vận hành, xử lý khiếu nại điểm uy tín và audit log
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="coffee-card p-5 bg-white border border-espresso-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cream-200 text-caramel flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-espresso">{totalUsers}</div>
            <div className="text-xs text-muted-gray">Tổng tài khoản</div>
          </div>
        </div>

        <div className="coffee-card p-5 bg-white border border-espresso-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cream-200 text-sage flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-espresso">{totalEvents}</div>
            <div className="text-xs text-muted-gray">Kèo cà phê</div>
          </div>
        </div>

        <div className="coffee-card p-5 bg-white border border-espresso-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cream-200 text-orange-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-espresso">{totalCheckins}</div>
            <div className="text-xs text-muted-gray">Lượt Check-in GPS+QR</div>
          </div>
        </div>
      </div>

      {/* Appeals Queue */}
      <div className="coffee-card p-6 bg-white border border-espresso-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-espresso-100">
          <h2 className="text-base font-bold text-espresso flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Hàng đợi khiếu nại (Appeals / No-Show Review)</span>
          </h2>
          <span className="text-xs text-muted-gray">{appeals.length} khiếu nại</span>
        </div>

        {appeals.length === 0 ? (
          <p className="text-xs text-muted-gray py-4 text-center">
            Không có khiếu nại nào đang chờ xử lý.
          </p>
        ) : (
          <div className="space-y-3">
            {appeals.map((app) => {
              const profile = dataStore.profiles.find((p) => p.id === app.user_id);
              return (
                <div
                  key={app.id}
                  className="p-4 rounded-xl border border-espresso-100 bg-cream-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-espresso">
                        {profile?.display_name || "Thành viên"}
                      </span>
                      <span className="text-[10px] text-muted-gray">@{profile?.username}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : app.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {app.status === "pending"
                          ? "Đang chờ duyệt"
                          : app.status === "approved"
                          ? "Đã chấp thuận"
                          : "Đã từ chối"}
                      </span>
                    </div>

                    <p className="text-xs text-espresso leading-relaxed">
                      Lý do: <em>"{app.reason}"</em>
                    </p>
                  </div>

                  {app.status === "pending" && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleResolveAppeal(app.id, "approved")}
                        className="px-3 py-1.5 rounded-xl bg-sage hover:bg-sage-600 text-white text-xs font-bold flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Chấp thuận & Hoàn điểm</span>
                      </button>
                      <button
                        onClick={() => handleResolveAppeal(app.id, "rejected")}
                        className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
