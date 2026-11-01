"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Bell, User, PlusCircle } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/groups", label: "Nhóm bạn", icon: Users },
    { href: "/groups/create", label: "Tạo nhóm", icon: PlusCircle },
    { href: "/notifications", label: "Thông báo", icon: Bell },
    { href: "/me", label: "Hồ sơ", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-espresso-100 px-4 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 rounded-xl text-xs font-medium transition-colors ${
              isActive
                ? "text-espresso font-bold"
                : "text-espresso-400 hover:text-espresso"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-caramel stroke-[2.5]" : ""}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
