# HẸN CÀ PHÊ — Private Friend Group Coffee Meetup Web App

> **Định hướng sản phẩm cốt lõi:** Web app **riêng tư** dành cho nhóm bạn thân cùng lên lịch đi cà phê.
> **Không phải:** App hẹn hò/ghép đôi, không tìm người lạ, không có kèo công khai toàn quốc, không có chat người lạ.
> Mọi dữ liệu (nhóm bạn, kèo cà phê, danh sách người đi, bản đồ GPS, điểm uy tín, bảng xếp hạng) đều hoàn toàn riêng tư trong từng nhóm bạn được mời.

---

## 1. TÍNH NĂNG VÀ TRẠNG THÁI TRIỂN KHAI

Theo yêu cầu mục 20 của Master Prompt, các tính năng được phân loại rõ theo 3 trạng thái:

| Tính năng | Trạng thái | Mô tả chi tiết |
|---|---|---|
| **Nhóm bạn riêng tư & Lời mời** |  Hoàn thành & Đã kiểm thử | Tạo nhóm, mời bạn bè bằng mã/token có thời hạn, phân quyền Owner/Admin/Member. Chống rò rỉ dữ liệu chéo nhóm. |
| **Kèo cà phê trong nhóm** |  Hoàn thành & Đã kiểm thử | Thành viên nhóm tạo kèo, tự động thêm Host vào danh sách, đặt hạn hủy và hạn bình chọn linh hoạt. |
| **Tham gia tức thì (RSVP)** |  Hoàn thành & Đã kiểm thử | Bấm tham gia ngay, kiểm tra sĩ số (capacity), hủy trước hạn miễn phí, hủy sau hạn trừ điểm uy tín. |
| **Đề xuất quán & Bình chọn** |  Hoàn thành & Đã kiểm thử | Thành viên đề xuất quán cà phê, mỗi người 1 phiếu và có thể đổi phiếu. Tự động chốt quán khi đóng bình chọn. |
| **Bản đồ Live Tracking & GPS** |  Hoàn thành & Đã kiểm thử | Xin quyền Geolocation minh bạch, hiển thị bạn bè đang di chuyển trên bản đồ, vòng bán kính check-in 100m, phát hiện mất tín hiệu (stale/offline). |
| **Check-in QR có chữ ký + GPS** |  Hoàn thành & Đã kiểm thử | Host tạo mã QR xoay vòng (60s) bằng HMAC SHA-256 + Nonce chống chụp ảnh; Thành viên quét camera và xác thực tọa độ GPS < 100m. |
| **Hỗ trợ check-in thủ công** |  Hoàn thành & Đã kiểm thử | Luồng gửi yêu cầu hỗ trợ khi camera/GPS trục trặc, tạo khiếu nại (Appeal) để Host/Admin duyệt, chống phạt oan. |
| **Gamification theo từng nhóm** |  Hoàn thành & Đã kiểm thử | Khởi tạo 100 điểm uy tín cho mỗi nhóm; tính điểm (+3 đúng giờ, +1 trễ, -3 hủy sau hạn, -15 bùng kèo), cấp độ 1-5, XP, chuỗi streak. |
| **Huy hiệu "Chúa tể bùng kèo"** |  Hoàn thành & Đã kiểm thử | Tự động kích hoạt khi có từ 3 lần xác nhận không đến (no_show_confirmed), kèm quyền gửi khiếu nại minh bạch. |
| **Bảng xếp hạng nội bộ nhóm** |  Hoàn thành & Đã kiểm thử | Xếp hạng theo Tuần, Tháng, Mọi thời đại chỉ trong phạm vi nhóm bạn; tuyệt đối không có ranking toàn quốc. |
| **Trang Quản trị Admin** |  Hoàn thành & Đã kiểm thử | Dashboard thống kê tổng quan, duyệt/từ chối khiếu nại no-show và hoàn điểm uy tín. |
| **Tích hợp Google Places (New)** | 🔑 Đã viết (Cần Credentials) | API wrapper tại `/api/maps/places` sẵn sàng, trả về thông báo hướng dẫn cấu hình khi chưa có key. |
| **Tích hợp Google Routes API (ETA)** | 🔑 Đã viết (Cần Credentials) | API wrapper tại `/api/maps/routes` sẵn sàng tính ETA giao thông thực tế. |
| **Database Migration & RLS** |  Hoàn thành & Đã kiểm thử | File SQL `supabase/migrations/20261101_init_hen_ca_phe.sql` đầy đủ 18 bảng, indexes và RLS policies. |

---

## 2. CÔNG NGHỆ SỬ DỤNG

- **Framework:** Next.js (App Router, React 18/19, TypeScript).
- **Styling:** Tailwind CSS (bảng màu ấm Espresso, Caramel, Sage, Cream).
- **Bảo mật QR:** HMAC-SHA256 Token với Nonce một lần và hạn sử dụng 60 giây.
- **Thư viện Web Camera:** `@zxing/browser` cho trình quét mã QR camera.
- **Tính toán tọa độ:** Công thức Haversine (bán kính Trái Đất 6.371.000m) kiểm tra Geofence < 100m.
- **Database & Auth:** Supabase PostgreSQL với Row Level Security (RLS).
- **Kiểm thử tự động:** Vitest (13/13 unit tests pass).

---

## 3. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY LOCAL

### 3.1. Yêu cầu môi trường
- Node.js version 18.18+ hoặc 20+ (Khuyến nghị Node.js v20+)
- npm hoặc pnpm

### 3.2. Cài đặt Dependencies
```bash
npm install
```

### 3.3. Cấu hình Biến Môi Trường
Sao chép file `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```

Nội dung `.env.local` tối thiểu:
```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=HẸN CÀ PHÊ
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Ho_Chi_Minh

# Cấu hình Supabase (nếu có dự án thật)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Khóa bí mật ký mã QR Check-in (Tối thiểu 32 ký tự)
CHECKIN_SECRET_KEY=super-secret-key-at-least-32-characters-long-hen-ca-phe

# Khóa Google Maps (Nếu muốn dùng bản đồ Google thực tế)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_SERVER_API_KEY=

# Scheduled Cron Secret
CRON_SECRET=my-cron-secret-hen-ca-phe
```

> **Ghi chú chạy Offline/Local:** Ứng dụng tích hợp sẵn data store phát triển (`src/lib/data-store.ts`) kèm 4 tài khoản mẫu và 2 nhóm bạn demo. Bạn có thể trải nghiệm toàn bộ luồng tạo nhóm, tạo kèo, bình chọn quán, chia sẻ GPS, quét QR check-in ngay cả khi chưa kết nối Supabase hoặc Google Maps API!

### 3.4. Chạy Database Migrations (Khi dùng Supabase)
Chạy script migration trong Supabase SQL Editor:
1. Mở dự án trên [Supabase Dashboard](https://supabase.com).
2. Vào **SQL Editor**.
3. Chạy toàn bộ file `supabase/migrations/20261101_init_hen_ca_phe.sql`.
4. Chạy file `supabase/seed.sql` để khởi tạo các huy hiệu hệ thống (Đúng giờ, Cạ cứng, Chúa tể bùng kèo).

### 3.5. Chạy Kiểm Thử (Unit Tests)
```bash
npm test
```

### 3.6. Chạy Development Server
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 4. TÀI KHOẢN MẪU DÀNH CHO KIỂM THỬ (DEV ACCOUNTS)

Ứng dụng có sẵn nút chuyển đổi tài khoản nhanh ở góc phải trên thanh điều hướng (Navbar):

| Tên hiển thị | Username | Vai trò | Điểm uy tín | Đặc điểm |
|---|---|---|---|---|
| **Định Nguyễn** | `dinhnguyen` | Chủ nhóm / Host | 112đ | Host của kèo Chủ Nhật, tạo phiên mã QR check-in |
| **Mai Trần** | `maitran` | Admin nhóm | 106đ | Host kèo acoustic, tham gia bình chọn quán |
| **Nam Lê** | `namle` | Thành viên | 115đ | Đạt huy hiệu "Đúng giờ" & "Người giữ lời", đang chia sẻ GPS |
| **Tuấn Phạm** | `tuanpham` | Thành viên | 55đ | Sở hữu huy hiệu vui **"Chúa tể bùng kèo"** (3 lần no-show) |
| **Quản Trị Viên** | `admin` | Admin hệ thống | — | Quản trị nền tảng, duyệt khiếu nại no-show tại `/admin` |

---

## 5. CÁC ĐƯỜNG DẪN CHÍNH (PAGES & URLS)

- `/` — Trang giới thiệu sản phẩm (chỉ giới thiệu, không lộ bất kỳ dữ liệu riêng tư nào).
- `/groups` — Danh sách các nhóm bạn riêng tư của tôi.
- `/groups/create` — Tạo nhóm bạn mới.
- `/invite/[token]` — Nhận lời mời vào nhóm bạn thân.
- `/groups/[groupId]` — Tổng quan nhóm, thành viên và các kèo cà phê.
- `/groups/[groupId]/events/create` — Tạo kèo cà phê trong nhóm.
- `/groups/[groupId]/events/[eventId]` — Chi tiết kèo (Bình chọn quán, Bản đồ GPS bạn bè, Quét QR Check-in).
- `/groups/[groupId]/leaderboard` — Bảng xếp hạng thành tích nội bộ nhóm bạn.
- `/groups/[groupId]/members/[userId]` — Xem hồ sơ thành viên trong nhóm.
- `/me` — Hồ sơ cá nhân của tôi & điểm uy tín từng nhóm.
- `/settings/privacy` — Thiết lập quyền riêng tư & giải thích dữ liệu GPS.
- `/notifications` — Trung tâm thông báo.
- `/admin` — Bảng quản trị & xử lý khiếu nại điểm uy tín.

---

## 6. LƯU Ý VỀ GIỚI HẠN KỸ THUẬT

1. **GPS trên nền web:** Trình duyệt di động có thể tạm dừng `watchPosition` khi người dùng tắt màn hình hoặc chuyển tab. Ứng dụng có cơ chế nhận diện trạng thái `Stale/Offline` (vị trí quá 2 phút không gửi) để bạn bè biết rõ thay vì giả lập vị trí.
2. **Quyền Camera & Geolocation:** Trình duyệt yêu cầu kết nối an toàn (HTTPS hoặc `localhost`) để xin quyền Camera quét QR và GPS.
3. **Chống Replay QR:** Mã QR của Host tự xoay vòng mỗi 60 giây và có chữ ký HMAC kèm Nonce độc nhất, ngăn chặn hành vi chụp ảnh màn hình gửi qua ứng dụng khác để check-in hộ.
