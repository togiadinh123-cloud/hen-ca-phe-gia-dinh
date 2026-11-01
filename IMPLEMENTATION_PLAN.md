# KẾ HOẠCH TRIỂN KHAI — HẸN CÀ PHÊ (PRIVATE COFFEE MEETUP WEB APP)

> **Mục tiêu:** Xây dựng trọn vẹn web app responsive riêng tư "HẸN CÀ PHÊ" cho nhóm bạn tổ chức cà phê, bình chọn quán, chia sẻ GPS thời gian thực khi di chuyển và check-in QR + GPS chống gian lận. Tuyệt đối không làm mạng xã hội công khai, không hẹn hò/ghép đôi, không chat. Mọi dữ liệu (kèo, thành viên, bản đồ, điểm uy tín) đều gói gọn trong từng nhóm bạn riêng tư.

---

## 1. TIẾN ĐỘ THỰC HIỆN THEO GIAI ĐOẠN

### Phase 0: Khởi tạo Project & Cấu hình nền tảng
- [x] Khởi tạo dự án Next.js (App Router, TypeScript, Tailwind CSS, Vitest).
- [x] Cài đặt dependencies cốt lõi (`@supabase/ssr`, `@supabase/supabase-js`, `@zxing/browser`, `@zxing/library`, `qrcode`, `lucide-react`, `date-fns`).
- [x] Thiết lập bảng màu Brand chuẩn ("Espresso" `#3B2A22`, "Cream" `#FFF8EF`, "Caramel" `#C9824A`, "Sage" `#78927A`).
- [x] Thiết lập `.env.example`, Supabase client/server/admin helpers.
- [x] Thiết lập thư viện lõi: Haversine distance (`geo.ts`), cryptographic QR tokens (`qr-security.ts`), time formatting & deadline checks (`time.ts`), gamification rules (`reputation.ts`).

### Phase 1: Database Migration, Authentication & Nhóm bạn riêng tư
- [x] Database migration đầy đủ `supabase/migrations/20261101_init_hen_ca_phe.sql` (18 bảng, indexes, security helper functions, RLS policies).
- [x] Seed data hệ thống `supabase/seed.sql` (Badges: Đúng giờ, Người giữ lời, Cạ cứng, Chúa tể bùng kèo).
- [x] Màn hình Landing Page `/` (giới thiệu công cụ riêng tư, không lộ kèo hay thành viên ra bên ngoài).
- [x] Màn hình Đăng nhập `/login` & Đăng ký `/register` (kèm đăng nhập nhanh tài khoản test).
- [x] Danh sách nhóm bạn của tôi `/groups` & Tạo nhóm mới `/groups/create`.
- [x] Nhận lời mời vào nhóm qua token `/invite/[token]`.
- [x] Chi tiết nhóm `/groups/[groupId]` (danh sách kèo, thành viên, tạo link mời).
- [x] Tạo kèo cà phê `/groups/[groupId]/events/create` (tự động đăng ký host, thời hạn bình chọn & hủy linh hoạt).
- [x] Đăng ký tham gia ngay (RSVP) & hủy tham gia trước/sau hạn quy định.

### Phase 2: Đề xuất quán & Bình chọn địa điểm
- [x] Component bình chọn quán `VenueVoting.tsx` (đề xuất quán, bình chọn 1 phiếu/người, đổi phiếu, realtime percentage bar).
- [x] Chốt quán khi đóng poll, chọn quán cao phiếu nhất, phá hòa (tie-breaking).
- [x] Link mở Google Maps chính thức.
- [x] API wrapper Places API New tại `/api/maps/places` (trạng thái cấu hình rõ ràng).

### Phase 3: Chia sẻ vị trí GPS Live & Bản đồ hành trình
- [x] Luồng xin quyền Geolocation minh bạch kèm giải thích an toàn (`LiveTracker.tsx`).
- [x] Nút "Bắt đầu di chuyển" và "Dừng chia sẻ vị trí" (chu kỳ gửi 20s, accuracy check).
- [x] Component bản đồ `GoogleMapView.tsx` hiển thị quán chốt, bạn bè di chuyển, vòng geofence 100m, ETA và phát hiện vị trí quá hạn (Stale/Offline).
- [x] API wrapper Routes API tại `/api/maps/routes` (tính ETA và khoảng cách).

### Phase 4: Xác nhận có mặt — Check-in GPS + QR bảo mật
- [x] Host Geofence Verification: Host mở phiên QR check-in quanh quán (`HostQrModal.tsx`).
- [x] Rotating QR Token: Mã QR có chữ ký HMAC-SHA256, nonce một lần chống replay, tự làm mới sau 60s.
- [x] Participant Scanner: Quét mã QR qua camera trình duyệt (`@zxing/browser`) và xác thực GPS < 100m (`ParticipantQrScanner.tsx`).
- [x] Chống check-in lặp, ghi nhận vào DB và cộng +3 điểm uy tín, +20 XP.
- [x] Luồng "Yêu cầu hỗ trợ check-in" khi camera/GPS lỗi để Host/Admin duyệt, không phạt oan.

### Phase 5: Gamification — Điểm uy tín, XP, Cấp độ & Huy hiệu
- [x] Điểm uy tín (100đ khởi đầu), XP, cấp độ 1-5, streak đúng giờ.
- [x] Huy hiệu đặc biệt "Chúa tể bùng kèo" (khi có >=3 lần no-show xác nhận).
- [x] Bảng xếp hạng trong nhóm `/groups/[groupId]/leaderboard` (Tuần, Tháng, Mọi thời đại; không có ranking toàn quốc).
- [x] Xem hồ sơ thành viên trong nhóm `/groups/[groupId]/members/[userId]`.
- [x] Hồ sơ cá nhân `/me` & Cài đặt quyền riêng tư `/settings/privacy`.
- [x] Trung tâm thông báo `/notifications`.

### Phase 6: Admin, Kiểm thử & Đóng gói sản phẩm
- [x] Dashboard Quản trị `/admin` duyệt khiếu nại no-show và hoàn điểm uy tín.
- [x] Unit test suites `tests/core.test.ts` (13/13 tests pass).
- [x] TypeScript Typecheck (`npm run typecheck`) hoàn thành với 0 lỗi.
- [x] Next.js Production Build (`npm run build`) hoàn thành thành công 100%.
- [x] Tài liệu hướng dẫn `README.md`.
