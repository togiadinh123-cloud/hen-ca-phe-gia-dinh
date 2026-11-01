"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Users, Shield, Bell, User, MapPin, Pencil, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { dataStore } from "@/lib/data-store";
import { Profile } from "@/types/database";
import { APP_CONFIG } from "@/config/app";

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");

  useEffect(() => {
    setCurrentUser(dataStore.getCurrentUser());
    setProfiles([...dataStore.profiles]);
  }, []);

  const handleSwitchUser = (userId: string) => {
    dataStore.setCurrentUser(userId);
    setCurrentUser(dataStore.getCurrentUser());
    setShowUserDropdown(false);
    window.location.reload();
  };

  const handleStartEdit = (user: Profile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUser(user);
    setEditDisplayName(user.display_name);
    setEditUsername(user.username);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const cleanDisplay = editDisplayName.trim();
    if (!cleanDisplay) return;

    dataStore.updateProfile(editingUser.id, {
      display_name: cleanDisplay,
      username: editUsername.trim() || editingUser.username,
    });

    setProfiles([...dataStore.profiles]);
    setCurrentUser(dataStore.getCurrentUser());
    setEditingUser(null);
  };

  const navLinks = [
    { href: "/groups", label: "Nhóm của tôi", icon: Users },
    { href: "/notifications", label: "Thông báo", icon: Bell },
    { href: "/me", label: "Hồ sơ của tôi", icon: User },
    ...(currentUser?.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-espresso-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-espresso flex items-center justify-center text-cream shadow-md group-hover:bg-caramel transition-colors">
            <Coffee className="w-5 h-5 text-caramel group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg text-espresso tracking-tight">
              {APP_CONFIG.name}
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-cream-200 text-espresso-700 font-medium">
              Riêng tư theo nhóm
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-espresso-100 text-espresso font-semibold"
                    : "text-espresso-600 hover:text-espresso hover:bg-cream-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Switcher Dropdown (Dev & Testing helper) */}
        <div className="relative">
          {currentUser ? (
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 p-1.5 rounded-full border border-espresso-200 hover:border-caramel bg-white transition-all shadow-sm"
              title="Chuyển đổi tài khoản thử nghiệm"
            >
              <img
                src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                alt={currentUser.display_name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="hidden sm:inline text-xs font-semibold text-espresso pr-1">
                {currentUser.display_name}
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-espresso text-white hover:bg-caramel transition-colors"
            >
              Đăng nhập
            </Link>
          )}

          {/* User switcher menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-espresso-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-espresso-100 mb-1">
                <p className="text-xs text-muted-gray uppercase font-semibold">Tài khoản đang đăng nhập</p>
                <p className="text-sm font-bold text-espresso">{currentUser?.display_name}</p>
                <p className="text-xs text-caramel">@{currentUser?.username}</p>
              </div>

              <div className="py-1">
                <p className="px-3 py-1 text-[11px] font-semibold text-muted-gray uppercase">
                  Đổi tài khoản test:
                </p>
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded-xl transition-colors ${
                      p.id === currentUser?.id
                        ? "bg-espresso-100 font-bold text-espresso"
                        : "hover:bg-cream-100 text-espresso-600"
                    }`}
                  >
                    <button
                      onClick={() => handleSwitchUser(p.id)}
                      className="flex items-center space-x-2.5 flex-1 text-left text-xs truncate mr-1 py-1"
                    >
                      <img
                        src={p.avatar_url || ""}
                        alt={p.display_name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 truncate">
                        <div className="truncate">{p.display_name}</div>
                        <div className="text-[10px] text-muted-gray font-normal">
                          {p.role === "admin" ? "Admin" : `@${p.username}`}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(p, e)}
                      className="p-1 rounded-lg text-espresso-400 hover:text-caramel hover:bg-white transition-colors"
                      title={`Đổi tên ${p.display_name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-espresso-100 flex items-center justify-between px-2 text-xs">
                <Link
                  href="/settings/privacy"
                  onClick={() => setShowUserDropdown(false)}
                  className="text-muted-gray hover:text-espresso py-1"
                >
                  Quyền riêng tư
                </Link>
                <Link
                  href="/login"
                  onClick={() => setShowUserDropdown(false)}
                  className="text-caramel font-semibold py-1"
                >
                  Đăng xuất
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal chỉnh sửa tên tài khoản */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-espresso-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-espresso-100 mb-4">
              <h3 className="font-extrabold text-base text-espresso flex items-center space-x-2">
                <Pencil className="w-4 h-4 text-caramel" />
                <span>Sửa tên tài khoản</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-full text-muted-gray hover:text-espresso hover:bg-cream-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-espresso mb-1">
                  Tên hiển thị:
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Ví dụ: Gia Định, Tuấn, Bảo..."
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:border-caramel focus:ring-1 focus:ring-caramel"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso mb-1">
                  Tên người dùng (@username):
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Ví dụ: giadinh, tuanpham..."
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:border-caramel focus:ring-1 focus:ring-caramel"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 rounded-xl border border-espresso-200 text-xs font-semibold text-espresso-700 hover:bg-cream-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-espresso text-white text-xs font-bold hover:bg-caramel transition-colors flex items-center justify-center space-x-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
