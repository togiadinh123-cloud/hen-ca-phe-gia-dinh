import Link from "next/link";
import { Coffee, ShieldCheck, Lock, MapPin } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream-100 py-12 border-t border-espresso-800 mt-20 pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-caramel flex items-center justify-center text-white">
                <Coffee className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">{APP_CONFIG.name}</span>
            </div>
            <p className="text-xs text-cream-300 leading-relaxed max-w-sm">
              Ứng dụng riêng tư để nhóm bạn lên lịch đi cà phê, cùng bình chọn quán, chia sẻ GPS tự nguyện khi di chuyển và check-in xác nhận có mặt bằng QR + vị trí thực tế.
            </p>
            <div className="flex items-center space-x-4 pt-1 text-xs text-caramel-300">
              <span className="flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-sage" />
                <span>100% Nhóm riêng tư</span>
              </span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                <span>Không ghép đôi / Người lạ</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Tính năng</h4>
            <ul className="space-y-2 text-xs text-cream-200">
              <li>
                <Link href="/groups" className="hover:text-caramel transition-colors">
                  Nhóm bạn của tôi
                </Link>
              </li>
              <li>
                <Link href="/groups/create" className="hover:text-caramel transition-colors">
                  Tạo nhóm bạn mới
                </Link>
              </li>
              <li>
                <Link href="/me" className="hover:text-caramel transition-colors">
                  Hồ sơ & Điểm uy tín
                </Link>
              </li>
              <li>
                <Link href="/settings/privacy" className="hover:text-caramel transition-colors">
                  Chính sách vị trí GPS
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Privacy Notice */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Cam kết bảo mật</h4>
            <p className="text-xs text-cream-300 leading-relaxed">
              GPS chỉ bật khi bạn bấm “Bắt đầu di chuyển” và tự động dừng ngay khi check-in hoặc kết thúc kèo. Chỉ bạn bè tham gia cùng kèo mới nhìn thấy vị trí của bạn.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-espresso-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-300">
          <p>© 2026 {APP_CONFIG.name}. Múi giờ Việt Nam (Asia/Ho_Chi_Minh).</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link href="/settings/privacy" className="hover:text-white transition-colors">
              Quyền riêng tư
            </Link>
            <span>•</span>
            <span className="text-sage">Môi trường phát triển & kiểm thử</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
