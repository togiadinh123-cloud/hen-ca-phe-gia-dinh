"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Lock, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { dataStore } from "@/lib/data-store";

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const currentUser = dataStore.getCurrentUser();
    const newGroup = dataStore.createGroup(name, description, currentUser.id);

    setTimeout(() => {
      setLoading(false);
      router.push(`/groups/${newGroup.id}`);
    }, 300);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link
        href="/groups"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-gray hover:text-espresso mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách nhóm</span>
      </Link>

      <div className="coffee-card p-6 sm:p-8 border border-espresso-100 shadow-xl bg-white">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-espresso-100">
          <div className="w-12 h-12 rounded-2xl bg-espresso text-cream flex items-center justify-center shadow-md">
            <Users className="w-6 h-6 text-caramel" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-espresso">Tạo nhóm bạn riêng tư</h1>
            <p className="text-xs text-muted-gray mt-0.5">
              Chỉ những bạn bè bạn mời qua liên kết mới có quyền vào nhóm
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-espresso mb-1">
              Tên nhóm bạn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Hội Bạn Thân Cà Phê Sáng, Team Dev Cuối Tuần..."
              className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso mb-1">
              Mô tả nhóm (Tùy chọn)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu ngắn về nhóm bạn, sở thích cà phê chung..."
              className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
            />
          </div>

          {/* Privacy Rules Explainer */}
          <div className="p-4 rounded-xl bg-cream-100 border border-cream-200 space-y-2 text-xs text-espresso-700">
            <div className="font-bold flex items-center space-x-1.5 text-espresso">
              <Lock className="w-3.5 h-3.5 text-caramel" />
              <span>Nguyên tắc nhóm riêng tư:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-muted-gray pl-1">
              <li>Bạn là Chủ nhóm (Owner) và có quyền gửi/thu hồi lời mời.</li>
              <li>Mỗi thành viên mới trong nhóm đều bắt đầu ở mức <strong>100 điểm uy tín</strong>.</li>
              <li>Mọi thành viên trong nhóm đều có quyền tạo kèo và cùng bình chọn quán.</li>
              <li>Tuyệt đối không hiển thị nhóm ra công khai hay cho phép người lạ tìm kiếm.</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 rounded-xl bg-espresso hover:bg-caramel disabled:bg-gray-300 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Đang tạo nhóm...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Hoàn tất & Mời bạn bè</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
