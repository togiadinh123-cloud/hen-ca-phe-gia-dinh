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
  const { placeId } = await req.json();

  if (!placeId) {
    return NextResponse.json({ error: "Thiếu placeId" }, { status: 400 });
  }

  const result = dataStore.votePlace(eventId, placeId, currentUser.id);

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ message: result.message });
}
