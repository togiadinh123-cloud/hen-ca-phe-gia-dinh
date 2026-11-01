"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, MapPin, Trophy, ShieldCheck, ArrowRight } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "notif_1",
      title: "Đã chốt quán cà phê!",
      message: "Kèo 'Cà phê sáng Chủ Nhật tán gẫu' đã chốt địa điểm: The Workshop Coffee (Quận 1).",
      link: "/groups/group_weekend_buddies/events/event_1",
      created_at: "10 phút trước",
      type: "venue_locked",
      is_read: false,
    },
    {
      id: "notif_2",
      title: "Nhận điểm uy tín & XP",
      message: "Bạn đã được cộng +3 điểm uy tín và +20 XP nhờ check-in đúng giờ tại Là Việt Coffee.",
      link: "/me",
      created_at: "2 ngày trước",
      type: "reputation",
      is_read: true,
    },
    {
      id: "notif_3",
      title: "Lời mời tham gia kèo mới",
      message: "Mai Trần vừa tạo kèo mới: 'Kèo acoustic tối thứ Tư' trong Hội Bạn Cà Phê Cuối Tuần.",
      link: "/groups/group_weekend_buddies/events/event_2",
      created_at: "3 ngày trước",
      type: "event_created",
      is_read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-espresso text-cream flex items-center justify-center">
            <Bell className="w-5 h-5 text-caramel" />
          </div>
          <div>
            <h1 className="text-xl font-black text-espresso">Thông báo</h1>
            <p className="text-xs text-muted-gray">Cập nhật về các kèo và bình chọn của nhóm bạn</p>
          </div>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-xs font-bold text-caramel hover:underline"
        >
          Đánh dấu đã đọc tất cả
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className={`coffee-card p-4 block border transition-all ${
              item.is_read
                ? "bg-white border-espresso-100"
                : "bg-cream-50/70 border-caramel/40 shadow-xs"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {item.type === "venue_locked" && (
                    <MapPin className="w-5 h-5 text-caramel" />
                  )}
                  {item.type === "reputation" && (
                    <Trophy className="w-5 h-5 text-sage" />
                  )}
                  {item.type === "event_created" && (
                    <Clock className="w-5 h-5 text-espresso" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-xs sm:text-sm text-espresso flex items-center space-x-2">
                    <span>{item.title}</span>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-caramel"></span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-gray leading-relaxed">{item.message}</p>
                </div>
              </div>

              <span className="text-[10px] text-muted-gray whitespace-nowrap">
                {item.created_at}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
