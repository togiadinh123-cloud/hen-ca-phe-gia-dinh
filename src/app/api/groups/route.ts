import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const currentUser = dataStore.getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const groups = dataStore.getUserGroups(currentUser.id);
  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  const currentUser = dataStore.getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Tên nhóm không hợp lệ" }, { status: 400 });
    }

    const group = dataStore.createGroup(name, description || "", currentUser.id);
    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tạo nhóm" }, { status: 500 });
  }
}
