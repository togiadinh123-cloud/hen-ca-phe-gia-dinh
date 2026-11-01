-- ==============================================================================
-- SEED DATA: seed.sql
-- DESCRIPTION: System badges and development demo data for "HẸN CÀ PHÊ"
-- NOTE: For development environment only.
-- ==============================================================================

-- 1. SEED SYSTEM BADGES
INSERT INTO public.badges (code, name, description, icon, criteria_config)
VALUES 
  (
    'on_time', 
    'Đúng giờ', 
    'Check-in QR và GPS hợp lệ, đúng giờ hẹn trong nhiều buổi cà phê.', 
    'ClockCheck', 
    '{"type": "on_time_count", "threshold": 3}'::jsonb
  ),
  (
    'promise_keeper', 
    'Người giữ lời', 
    'Hoàn thành liên tục các kèo cà phê đã đăng ký mà không hủy trễ hay bùng kèo.', 
    'ShieldCheck', 
    '{"type": "consecutive_clean_events", "threshold": 5}'::jsonb
  ),
  (
    'coffee_buddy', 
    'Cạ cứng cà phê', 
    'Thành viên năng nổ tham gia nhiều buổi cà phê cùng nhóm bạn.', 
    'Coffee', 
    '{"type": "attended_events_count", "threshold": 5}'::jsonb
  ),
  (
    'connector', 
    'Người kết nối', 
    'Tạo các kèo cà phê vui vẻ và thu hút bạn bè tham gia hoàn tất.', 
    'Sparkles', 
    '{"type": "hosted_events_count", "threshold": 3}'::jsonb
  ),
  (
    'venue_explorer', 
    'Khám phá quán mới', 
    'Đề xuất và check-in tại nhiều quán cà phê độc đáo khác nhau.', 
    'Compass', 
    '{"type": "distinct_venues_count", "threshold": 3}'::jsonb
  ),
  (
    'streak_master', 
    'Streak cà phê', 
    'Duy trì thói quen đi cà phê cùng bạn bè các tuần liên tiếp.', 
    'Flame', 
    '{"type": "streak_weeks", "threshold": 3}'::jsonb
  ),
  (
    'flake_king', 
    'Chúa tể bùng kèo', 
    'Huy hiệu nhắc nhở vui khi có từ 3 lần xác nhận không đến mà không có lý do chính đáng.', 
    'Ghost', 
    '{"type": "no_show_confirmed_count", "threshold": 3}'::jsonb
  )
ON CONFLICT (code) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  criteria_config = EXCLUDED.criteria_config;
