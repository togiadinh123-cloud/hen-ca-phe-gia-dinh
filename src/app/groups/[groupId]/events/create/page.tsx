"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Coffee, ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign, Tag, Sparkles } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { FriendGroup, Profile } from "@/types/database";

export default function CreateEventPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [group, setGroup] = useState<FriendGroup | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState("Hồ Chí Minh");
  const [district, setDistrict] = useState("Quận 1");
  const [areaLabel, setAreaLabel] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [budgetMin, setBudgetMin] = useState<number | "">(40000);
  const [budgetMax, setBudgetMax] = useState<number | "">(90000);
  const [selectedTags, setSelectedTags] = useState<string[]>(["chill", "cuối tuần"]);
  const [pollClosesHoursBefore, setPollClosesHoursBefore] = useState(2);
  const [cancellationDeadlineHoursBefore, setCancellationDeadlineHoursBefore] = useState(1);
  const [initialVenueName, setInitialVenueName] = useState("");
  const [initialVenueAddress, setInitialVenueAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTags = ["chill", "học tập", "làm việc", "board game", "acoustic", "cuối tuần", "ăn sáng", "tán gẫu"];

  useEffect(() => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const res = dataStore.getGroupById(groupId, user.id);
      if (!res) {
        router.push("/groups");
        return;
      }
      setGroup(res.group);
    }

    // Default date to tomorrow at 09:30
    const tomorrow = new Date(Date.now() + 86400000);
    setDate(tomorrow.toISOString().split("T")[0]);
    setTime("09:30");
  }, [groupId, router]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !group) return;
    setError(null);

    // Validate datetime
    const startsAtDate = new Date(`${date}T${time}:00`);
    if (isNaN(startsAtDate.getTime())) {
      setError("Thời gian hẹn không hợp lệ.");
      return;
    }

    if (startsAtDate.getTime() <= Date.now()) {
      setError("Giờ hẹn phải nằm trong tương lai.");
      return;
    }

    const pollClosesAt = new Date(startsAtDate.getTime() - pollClosesHoursBefore * 3600000);
    const cancellationDeadline = new Date(startsAtDate.getTime() - cancellationDeadlineHoursBefore * 3600000);

    setLoading(true);

    const newEvent = dataStore.createEvent({
      group_id: group.id,
      host_id: currentUser.id,
      title: title.trim(),
      description: description.trim() || null,
      city,
      district,
      area_label: areaLabel.trim() || `${district}, ${city}`,
      starts_at: startsAtDate.toISOString(),
      timezone: "Asia/Ho_Chi_Minh",
      capacity: Number(capacity),
      budget_min: budgetMin ? Number(budgetMin) : null,
      budget_max: budgetMax ? Number(budgetMax) : null,
      tags: selectedTags,
      cover_image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
      poll_closes_at: pollClosesAt.toISOString(),
      cancellation_deadline: cancellationDeadline.toISOString(),
    });

    // If initial venue was specified
    if (initialVenueName.trim()) {
      dataStore.proposePlace(newEvent.id, currentUser.id, {
        google_place_id: `place_${Date.now()}`,
        place_name: initialVenueName.trim(),
        formatted_address: initialVenueAddress.trim() || `${district}, ${city}`,
        latitude: 10.774342,
        longitude: 106.704834,
      });
    }

    setTimeout(() => {
      setLoading(false);
      router.push(`/groups/${group.id}/events/${newEvent.id}`);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/groups/${groupId}`}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-gray hover:text-espresso mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại trang nhóm</span>
      </Link>

      <div className="coffee-card p-6 sm:p-8 border border-espresso-100 shadow-xl bg-white">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-espresso-100">
          <div className="w-12 h-12 rounded-2xl bg-espresso text-cream flex items-center justify-center shadow-md">
            <Coffee className="w-6 h-6 text-caramel" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-espresso">Tạo kèo cà phê mới</h1>
            <p className="text-xs text-muted-gray mt-0.5">
              Rủ bạn bè trong nhóm <strong>{group?.name}</strong> cùng tụ họp
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-espresso mb-1">
              Tiêu đề kèo cà phê <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Cà phê sáng Chủ Nhật tán gẫu, Kèo acoustic tối thứ Tư..."
              className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-espresso mb-1">
              Mô tả buổi hẹn (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mang theo laptop làm việc, mang theo board game, hoặc chỉ ngồi chill..."
              className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-espresso mb-1">
                Ngày hẹn <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso mb-1">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
                />
              </div>
            </div>
          </div>

          {/* Area & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-espresso mb-1">Thành phố</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso mb-1">Quận / Huyện</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso mb-1">Khu vực mong muốn</label>
              <input
                type="text"
                value={areaLabel}
                onChange={(e) => setAreaLabel(e.target.value)}
                placeholder="Gần Bến Thành, Hồ Con Rùa..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
            </div>
          </div>

          {/* Capacity & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-espresso mb-1">
                Số người tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={2}
                max={30}
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
              <span className="text-[10px] text-muted-gray mt-1 block">Đã bao gồm bạn (Host)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso mb-1">Ngân sách tối thiểu (VNĐ)</label>
              <input
                type="number"
                step={5000}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso mb-1">Ngân sách tối đa (VNĐ)</label>
              <input
                type="number"
                step={5000}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
            </div>
          </div>

          {/* Deadlines Section */}
          <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-3">
            <h4 className="text-xs font-bold text-espresso uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-caramel" />
              <span>Thời hạn linh hoạt do bạn thiết lập</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-gray mb-1">Đóng bình chọn quán trước giờ hẹn:</label>
                <select
                  value={pollClosesHoursBefore}
                  onChange={(e) => setPollClosesHoursBefore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-xs bg-white focus:outline-none"
                >
                  <option value={1}>Trước 1 giờ</option>
                  <option value={2}>Trước 2 giờ</option>
                  <option value={4}>Trước 4 giờ</option>
                  <option value={12}>Trước 12 giờ</option>
                  <option value={24}>Trước 24 giờ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted-gray mb-1">Hạn hủy miễn phí trước giờ hẹn:</label>
                <select
                  value={cancellationDeadlineHoursBefore}
                  onChange={(e) => setCancellationDeadlineHoursBefore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-xs bg-white focus:outline-none"
                >
                  <option value={0.5}>Trước 30 phút</option>
                  <option value={1}>Trước 1 giờ</option>
                  <option value={2}>Trước 2 giờ</option>
                  <option value={4}>Trước 4 giờ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-espresso mb-2">Thẻ mục đích buổi gặp</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      active
                        ? "bg-caramel text-white font-bold"
                        : "bg-cream-100 text-espresso-700 hover:bg-cream-200"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Venue Proposal (Optional) */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-espresso mb-1">
              Gợi ý quán đầu tiên (Tùy chọn)
            </label>
            <input
              type="text"
              value={initialVenueName}
              onChange={(e) => setInitialVenueName(e.target.value)}
              placeholder="Tên quán bạn muốn gợi ý (hoặc để trống để bạn bè cùng thêm)"
              className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel mb-2"
            />
            {initialVenueName && (
              <input
                type="text"
                value={initialVenueAddress}
                onChange={(e) => setInitialVenueAddress(e.target.value)}
                placeholder="Địa chỉ quán (số nhà, đường, phường)"
                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-espresso hover:bg-caramel text-white font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Đang tạo kèo...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Hoàn tất & Mở kèo cho nhóm</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
