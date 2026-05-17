import { NextRequest, NextResponse } from "next/server";
import { createToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const passcode = ((body.passcode as string) ?? "").trim();

  let user: AuthUser | null = null;

  if (passcode && passcode === process.env.PASSCODE_CLAIRE) {
    user = "claire";
  } else if (passcode && passcode === process.env.PASSCODE_BANBAN) {
    user = "banban";
  }

  if (!user) {
    return NextResponse.json({ error: "暗號錯誤！再想想看？" }, { status: 401 });
  }

  const token = await createToken(user);
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
