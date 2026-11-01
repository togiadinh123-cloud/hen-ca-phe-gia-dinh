"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Coffee, Users, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { FriendGroup, Profile } from "@/types/database";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [group, setGroup] = useState<FriendGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    // For demo purposes, link to first group
    const targetGroup = dataStore.groups[0];
    setGroup(targetGroup);
  }, []);

  const handleAccept = () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const res = dataStore.acceptInvitation(token, currentUser.id);

    setTimeout(() => {
      setLoading(false);
      if (res.success) {
        setStatusMessage(res.message);
        router.push(`/groups/${res.groupId || group?.id}`);
      } else {
        setError(res.message);
      }
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="coffee-card p-8 border border-espresso-100 shadow-xl bg-white text-center">
        <div className="w-14 h-14 rounded-2xl bg-cream-200 text-espresso flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Users className="w-7 h-7 text-caramel" />
        </div>

        <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cream-100 text-espresso text-[11px] font-semibold mb-3">
          <Lock className="w-3 h-3 text-caramel" />
          <span>Lời mời vào nhóm riêng tư</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-espresso">
          Gia nhập nhóm bạn
        </h1>

        {group && (
          <div className="my-6 p-4 rounded-2xl bg-cream-50 border border-cream-200 text-left">
            <h3 className="font-bold text-espresso text-base">{group.name}</h3>
            <p className="text-xs text-muted-gray mt-1 leading-relaxed">
              {group.description || "Nhóm bạn thân hẹn hò cà phê cuối tuần."}
            </p>
            <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between text-xs text-muted-gray">
              <span>Khởi tạo điểm uy tín:</span>
              <span className="font-bold text-sage">100 điểm</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-medium">
            {statusMessage}
          </div>
        )}

        {currentUser ? (
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-espresso hover:bg-caramel text-white font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Đang tham gia...</span>
            ) : (
              <>
                <span>Xác nhận tham gia nhóm</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-gray">
              Bạn cần đăng nhập để xác nhận lời mời vào nhóm
            </p>
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-espresso hover:bg-caramel text-white font-bold text-sm block transition-all"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
