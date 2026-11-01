export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Hẹn cà phê với Gia Định",
  description: "Web app riêng tư để nhóm bạn cùng lên lịch, chọn quán, chia sẻ vị trí và check-in cà phê.",
  timezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Asia/Ho_Chi_Minh",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Gamification Rules (Section 7.2)
  reputation: {
    initialScore: 100, // Điểm khởi đầu cho mỗi thành viên trong từng nhóm
    checkinOnTimeDelta: 3, // Check-in QR + GPS hợp lệ, đúng giờ (+3)
    checkinLateDelta: 1, // Check-in hợp lệ nhưng đến trễ (+1)
    cancelBeforeDeadlineDelta: 0, // Hủy trước hạn (0)
    cancelAfterDeadlineDelta: -3, // Hủy sau hạn (-3)
    noShowConfirmedDelta: -15, // Xác nhận không đến (-15)
  },

  xp: {
    checkinOnTime: 20,
    checkinLate: 15,
    popularVenueProposal: 3,
  },

  // Levels (Section 7.3)
  levels: [
    { level: 1, title: "Tân binh cà phê", minXp: 0, maxXp: 49 },
    { level: 2, title: "Người quen quán", minXp: 50, maxXp: 149 },
    { level: 3, title: "Cạ cứng cà phê", minXp: 150, maxXp: 349 },
    { level: 4, title: "Tâm điểm hội cà phê", minXp: 350, maxXp: 699 },
    { level: 5, title: "Huyền thoại quán quen", minXp: 700, maxXp: Infinity },
  ],

  // Verification & Geofence (Section 6.6)
  geofence: {
    maxVenueRadiusMeters: 100, // Mặc định 100m quanh quán
    maxGpsAccuracyMeters: 60, // Cảnh báo/từ chối khi sai số GPS quá lớn (>60m)
    staleLocationThresholdSeconds: 120, // 2 phút không gửi vị trí -> stale
    locationUpdateIntervalSeconds: 25, // Chu kỳ gửi GPS tự động
    qrTokenExpirySeconds: 60, // Mỗi mã QR chỉ có hiệu lực 60 giây (rotating QR)
  },

  // Flake King Badge Threshold (Section 7.4)
  flakeKingThreshold: 3, // 3 lần bùng kèo được xác nhận -> trao huy hiệu Chúa tể bùng kèo
};
