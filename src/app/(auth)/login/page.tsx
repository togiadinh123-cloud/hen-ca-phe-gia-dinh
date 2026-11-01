"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { dataStore } from "@/lib/data-store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      // For development/demo environment, match username or default to user_dinh
      const matched = dataStore.profiles.find(
        (p) => p.username === email.toLowerCase().trim() || email.includes(p.username)
      );

      if (matched) {
        dataStore.setCurrentUser(matched.id);
      } else {
        dataStore.setCurrentUser("user_dinh");
      }
      setLoading(false);
      router.push("/groups");
    }, 400);
  };

  const handleQuickLogin = (userId: string) => {
    dataStore.setCurrentUser(userId);
    router.push("/groups");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="coffee-card p-8 border border-espresso-100 shadow-xl bg-white">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-espresso text-cream flex items-center justify-center mx-auto mb-3 shadow-md">
            <Coffee className="w-6 h-6 text-caramel" />
          </div>
          <h1 className="text-2xl font-black text-espresso">Đăng nhập</h1>
          <p className="text-xs text-muted-gray mt-1">
            Vào nhóm bạn riêng tư để xem các kèo cà phê sắp tới
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-espresso mb-1">Email hoặc Tên tài khoản</label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dinhnguyen hoặc email của bạn"
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
                placeholder="••••••••"
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
              <span>Đang xác thực...</span>
            ) : (
              <>
                <span>Vào ứng dụng</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins for Developers/Testers */}
        <div className="mt-8 pt-6 border-t border-espresso-100">
          <p className="text-[11px] font-bold text-muted-gray uppercase tracking-wider mb-2 text-center">
            Đăng nhập nhanh tài khoản thử nghiệm
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin("user_dinh")}
              className="p-2 rounded-xl border border-espresso-200 hover:border-caramel hover:bg-cream-100 text-left transition-colors"
            >
              <div className="font-bold text-espresso">Định Nguyễn</div>
              <div className="text-[10px] text-caramel">Chủ nhóm / Host</div>
            </button>
            <button
              onClick={() => handleQuickLogin("user_mai")}
              className="p-2 rounded-xl border border-espresso-200 hover:border-caramel hover:bg-cream-100 text-left transition-colors"
            >
              <div className="font-bold text-espresso">Mai Trần</div>
              <div className="text-[10px] text-muted-gray">Thành viên / Admin</div>
            </button>
            <button
              onClick={() => handleQuickLogin("user_nam")}
              className="p-2 rounded-xl border border-espresso-200 hover:border-caramel hover:bg-cream-100 text-left transition-colors"
            >
              <div className="font-bold text-espresso">Nam Lê</div>
              <div className="text-[10px] text-sage font-medium">Đúng giờ (115đ)</div>
            </button>
            <button
              onClick={() => handleQuickLogin("user_tuan")}
              className="p-2 rounded-xl border border-espresso-200 hover:border-caramel hover:bg-cream-100 text-left transition-colors"
            >
              <div className="font-bold text-espresso">Tuấn Phạm</div>
              <div className="text-[10px] text-red-500 font-medium">Chúa tể bùng kèo</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-gray">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-caramel font-bold hover:underline">
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
