"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, Lock, Mail, User, ArrowRight } from "lucide-react";
import { dataStore } from "@/lib/data-store";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newUser = {
        id: `user_${Date.now()}`,
        username: username.toLowerCase().trim() || `user_${Date.now()}`,
        display_name: displayName.trim() || "Thành viên mới",
        avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
        bio: "Thành viên mới tham gia Hẹn Cà Phê.",
        city: "Hồ Chí Minh",
        district: "Quận 1",
        coffee_preferences: ["Cà phê sữa đá"],
        role: "user" as const,
        show_in_leaderboard: true,
        show_badges: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dataStore.profiles.push(newUser);
      dataStore.setCurrentUser(newUser.id);
      setLoading(false);
      router.push("/groups");
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="coffee-card p-8 border border-espresso-100 shadow-xl bg-white">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-espresso text-cream flex items-center justify-center mx-auto mb-3 shadow-md">
            <Coffee className="w-6 h-6 text-caramel" />
          </div>
          <h1 className="text-2xl font-black text-espresso">Tạo tài khoản</h1>
          <p className="text-xs text-muted-gray mt-1">
            Đăng ký để tạo nhóm bạn và cùng lên lịch đi cà phê
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-espresso mb-1">Tên hiển thị của bạn</label>
            <div className="relative">
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ví dụ: Hoàng Long"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
              <User className="w-4 h-4 text-muted-gray absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso mb-1">Username (Biệt danh nội bộ)</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="hoanglong"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
              <span className="text-muted-gray text-xs absolute left-3.5 top-3 font-mono font-bold">@</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="long@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
              <Mail className="w-4 h-4 text-muted-gray absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
              <Lock className="w-4 h-4 text-muted-gray absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-espresso hover:bg-caramel text-white font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Đang tạo tài khoản...</span>
            ) : (
              <>
                <span>Hoàn tất đăng ký</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-gray">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-caramel font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
