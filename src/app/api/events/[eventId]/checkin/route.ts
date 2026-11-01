import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { verifySignedQrToken } from "@/lib/qr-security";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const currentUser = dataStore.getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { eventId } = params;
  try {
    const { token, latitude, longitude, accuracy } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Thiếu mã QR token" }, { status: 400 });
    }

    // 1. Verify token signature and expiration
    const verification = verifySignedQrToken(token);
    if (!verification.isValid || !verification.payload) {
      return NextResponse.json(
        { error: verification.error || "Mã QR không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    // 2. Verify matching event
    if (verification.payload.eventId !== eventId) {
      return NextResponse.json(
        { error: "Mã QR không khớp với buổi cà phê này" },
        { status: 400 }
      );
    }

    // 3. Process checkin in dataStore
    const result = dataStore.processCheckin(
      eventId,
      currentUser.id,
      token,
      Number(latitude) || 10.7743,
      Number(longitude) || 106.7048,
      Number(accuracy) || 15
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      message: result.message,
      repDelta: result.repDelta,
      xpDelta: result.xpDelta,
    });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xử lý check-in" }, { status: 500 });
  }
}
