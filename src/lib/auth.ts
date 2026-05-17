export const COOKIE_NAME = "auth_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type AuthUser = "claire" | "banban";

function getSecret(): string {
  const s = process.env.COOKIE_SECRET;
  if (!s) throw new Error("COOKIE_SECRET is not set");
  return s;
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function hmacVerify(
  message: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expected = await hmacSign(message, secret);
  return expected === signature;
}

export async function createToken(user: AuthUser): Promise<string> {
  const secret = getSecret();
  const payload = `${user}:${Date.now()}`;
  const sig = await hmacSign(payload, secret);
  return `${btoa(payload)}.${sig}`;
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const secret = getSecret();
    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return null;
    const payloadB64 = token.slice(0, dotIndex);
    const sig = token.slice(dotIndex + 1);
    const payload = atob(payloadB64);
    const valid = await hmacVerify(payload, sig, secret);
    if (!valid) return null;
    const user = payload.split(":")[0];
    if (user !== "claire" && user !== "banban") return null;
    return user as AuthUser;
  } catch {
    return null;
  }
}
