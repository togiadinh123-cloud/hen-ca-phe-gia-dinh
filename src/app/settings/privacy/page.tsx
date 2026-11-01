"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Navigation, Eye, Trash2, CheckCircle2 } from "lucide-react";

export default function PrivacySettingsPage() {
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/me"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-gray hover:text-espresso transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại hồ sơ</span>
      </Link>

      <div className="coffee-card p-6 sm:p-8 bg-white border border-espresso-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-espresso-100">
          <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-espresso">Cài đặt Quyền riêng tư & GPS</h1>
            <p className="text-xs text-muted-gray">Bảo vệ dữ liệu vị trí và danh tính của bạn</p>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã lưu cài đặt quyền riêng tư thành công!</span>
          </div>
        )}

        {/* Transparent Policy Box */}
        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-3 text-xs text-muted-gray leading-relaxed">
          <h3 className="font-bold text-espresso text-sm flex items-center space-x-1.5">
            <Navigation className="w-4 h-4 text-caramel" />
            <span>Chính sách minh bạch về dữ liệu GPS</span>
          </h3>

          <div className="space-y-2">
            <p>
              <strong>1. Mục đích sử dụng:</strong> GPS chỉ được dùng để tính khoảng cách và ETA thời gian thực tới quán cà phê đã chốt, và xác minh bạn có mặt trong bán kính 100m khi quét mã QR check-in.
            </p>
            <p>
              <strong>2. Ai nhìn thấy vị trí của bạn:</strong> Tuyệt đối chỉ có những người bạn đã xác nhận tham gia <em>cùng một kèo trong cùng một nhóm bạn</em> mới nhìn thấy tọa độ của bạn trên bản đồ. Người ngoài nhóm hoặc người không tham gia kèo không thể xem.
            </p>
            <p>
              <strong>3. Khi nào chia sẻ dừng lại:</strong> GPS tự động dừng ngay lập tức khi bạn bấm nút "Dừng chia sẻ vị trí", khi bạn check-in thành công tại quán, hoặc khi buổi cà phê kết thúc.
            </p>
            <p>
              <strong>4. Lưu trữ & xóa dữ liệu:</strong> Tọa độ live chỉ có hiệu lực tối đa 5 phút trong phiên. Hệ thống tự động xóa sạch dữ liệu tọa độ chi tiết định kỳ, không lưu vết lộ trình di chuyển lâu dài.
            </p>
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-3 rounded-xl border border-espresso-100 hover:bg-cream-50/50 transition-colors">
            <div>
              <div className="text-xs font-bold text-espresso">
                Hiển thị trong Bảng xếp hạng nhóm
              </div>
              <p className="text-[11px] text-muted-gray mt-0.5">
                Cho phép bạn bè trong nhóm xem điểm uy tín và XP của bạn trên leaderboard nội bộ.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showInLeaderboard}
              onChange={(e) => setShowInLeaderboard(e.target.checked)}
              className="w-4 h-4 text-caramel rounded focus:ring-caramel"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-espresso-100 hover:bg-cream-50/50 transition-colors">
            <div>
              <div className="text-xs font-bold text-espresso">
                Hiển thị Huy hiệu trong hồ sơ nhóm
              </div>
              <p className="text-[11px] text-muted-gray mt-0.5">
                Hiển thị các huy hiệu bạn đạt được (Đúng giờ, Cạ cứng, v.v.) cho thành viên trong nhóm xem.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showBadges}
              onChange={(e) => setShowBadges(e.target.checked)}
              className="w-4 h-4 text-caramel rounded focus:ring-caramel"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-espresso hover:bg-caramel text-white font-bold text-xs transition-colors shadow-sm"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
