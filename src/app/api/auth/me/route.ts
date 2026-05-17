import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME, USER_DISPLAY_NAMES } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({ user, displayName: USER_DISPLAY_NAMES[user] });
}
