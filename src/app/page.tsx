import Link from "next/link";
import { Coffee, MapPin, Users, QrCode, ShieldCheck, ArrowRight, Lock, Clock, Navigation } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-16">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cream-200 border border-caramel-200 text-espresso text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse"></span>
              <span>Dành riêng cho nhóm bạn đã quen biết</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-espresso tracking-tight leading-[1.15]">
              Chốt quán nhanh — <br />
              <span className="text-caramel">biết bạn bè đang tới đâu.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-gray leading-relaxed max-w-xl">
              Không còn cảnh nhắn tin hỏi dồn <em>"Tới đâu rồi?", "Còn mấy phút?", "Uống quán nào?"</em>. Cùng nhóm bạn thân đề xuất quán, bình chọn, bật GPS khi xuất phát và check-in xác nhận có mặt thật bằng QR.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link
                href="/groups"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-espresso hover:bg-caramel text-white font-bold text-base transition-all shadow-md hover:shadow-lg"
              >
                <span>Mở nhóm của tôi</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/groups/create"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-cream-100 text-espresso font-bold text-base border border-espresso-200 transition-all"
              >
                <span>Tạo nhóm bạn mới</span>
              </Link>
            </div>

            {/* Privacy Badges */}
            <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 border-t border-espresso-100 text-xs text-muted-gray">
              <div className="flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-caramel flex-shrink-0" />
                <span>Nhóm riêng tư 100%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-sage flex-shrink-0" />
                <span>Không tìm người lạ</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Navigation className="w-4 h-4 text-caramel flex-shrink-0" />
                <span>GPS chỉ bật khi đi</span>
              </div>
            </div>
          </div>

          {/* Interactive UI Mockup (Clearly marked as Demo Illustration) */}
          <div className="lg:col-span-5">
            <div className="coffee-card p-5 relative overflow-hidden border-2 border-espresso-100 shadow-xl bg-white">
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                Giao diện minh họa
              </div>

              {/* Event Header Mini Card */}
              <div className="flex items-center space-x-3 pb-4 border-b border-espresso-100">
                <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center text-espresso">
                  <Coffee className="w-6 h-6 text-caramel" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-caramel">Kèo Nhóm Bạn Thân</div>
                  <h3 className="text-sm font-bold text-espresso leading-snug">
                    Cà phê sáng Chủ Nhật tán gẫu
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-muted-gray mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>09:30 Chủ Nhật</span>
                    <span>•</span>
                    <span className="text-sage font-medium">Đã chốt quán</span>
                  </div>
                </div>
              </div>

              {/* Venue Preview */}
              <div className="mt-4 p-3 rounded-xl bg-cream-50 border border-cream-200">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-muted-gray uppercase">Địa điểm</span>
                    <h4 className="text-xs font-bold text-espresso">The Workshop Coffee</h4>
                    <p className="text-[11px] text-muted-gray">27 Ngô Đức Kế, Quận 1</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-sage-100 text-sage-700 text-[10px] font-bold">
                    3/3 phiếu
                  </span>
                </div>
              </div>

              {/* Friends Live Journey List */}
              <div className="mt-4 space-y-2.5">
                <div className="text-[11px] font-bold text-espresso uppercase tracking-wider flex items-center justify-between">
                  <span>Hành trình bạn bè (Live GPS)</span>
                  <span className="text-[10px] font-normal text-muted-gray">Chỉ thấy trong kèo</span>
                </div>

                {/* Friend 1: Near venue */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-espresso-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-espresso text-cream flex items-center justify-center font-bold text-[10px]">
                        ĐN
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-sage ring-1 ring-white"></span>
                    </div>
                    <div>
                      <span className="font-semibold text-espresso">Định Nguyễn (Chủ kèo)</span>
                      <p className="text-[10px] text-sage font-medium">Đang tới • Cách 250m</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-espresso">ETA 3 phút</span>
                </div>

                {/* Friend 2: On the way */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-espresso-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-caramel text-white flex items-center justify-center font-bold text-[10px]">
                        NL
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-sage ring-1 ring-white"></span>
                    </div>
                    <div>
                      <span className="font-semibold text-espresso">Nam Lê</span>
                      <p className="text-[10px] text-caramel font-medium">Đang đi • Cách 850m</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-espresso">ETA 8 phút</span>
                </div>

                {/* Friend 3: At home */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs opacity-75">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-bold text-[10px]">
                      MT
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Mai Trần</span>
                      <p className="text-[10px] text-muted-gray">Chưa bật chia sẻ vị trí</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-gray">Chờ xuất phát</span>
                </div>
              </div>

              {/* QR Verification mini banner */}
              <div className="mt-4 pt-3 border-t border-espresso-100 flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-espresso font-semibold text-[11px]">
                  <QrCode className="w-4 h-4 text-caramel" />
                  <span>Check-in GPS + QR bảo mật</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cream-200 text-espresso-700 font-medium">
                  Bán kính &lt; 100m
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE 4 STEPS WORKFLOW */}
      <section className="bg-white py-16 border-y border-espresso-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-caramel uppercase tracking-widest mb-2">Quy trình đơn giản</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-espresso">
              4 bước cho một buổi cà phê hoàn hảo cùng bạn bè
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="coffee-card p-6 border border-espresso-100">
              <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center text-espresso font-bold mb-4">
                1
              </div>
              <h3 className="font-bold text-espresso text-base mb-2">Tạo nhóm & mời bạn</h3>
              <p className="text-xs text-muted-gray leading-relaxed">
                Tạo nhóm riêng tư và gửi mã mời hoặc liên kết bảo mật cho hội bạn bè thân thiết.
              </p>
            </div>

            <div className="coffee-card p-6 border border-espresso-100">
              <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center text-espresso font-bold mb-4">
                2
              </div>
              <h3 className="font-bold text-espresso text-base mb-2">Lên kèo & chọn quán</h3>
              <p className="text-xs text-muted-gray leading-relaxed">
                Mọi người bấm tham gia ngay, cùng tìm quán trên Google Places và bình chọn địa điểm yêu thích.
              </p>
            </div>

            <div className="coffee-card p-6 border border-espresso-100">
              <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center text-espresso font-bold mb-4">
                3
              </div>
              <h3 className="font-bold text-espresso text-base mb-2">Bật GPS khi xuất phát</h3>
              <p className="text-xs text-muted-gray leading-relaxed">
                Tự nguyện bật chia sẻ vị trí để bạn bè biết bạn đang cách quán bao xa và ước tính thời gian tới.
              </p>
            </div>

            <div className="coffee-card p-6 border border-espresso-100">
              <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center text-espresso font-bold mb-4">
                4
              </div>
              <h3 className="font-bold text-espresso text-base mb-2">Check-in QR + GPS</h3>
              <p className="text-xs text-muted-gray leading-relaxed">
                Xác nhận có mặt thực tế tại quán bằng mã QR xoay vòng và tọa độ GPS dưới 100m để tích lũy điểm uy tín.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
