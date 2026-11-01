import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const currentUser = dataStore.getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { eventId } = params;
  const result = dataStore.leaveEvent(eventId, currentUser.id);

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({
    message: result.message,
    penalized: result.penalized,
  });
}
