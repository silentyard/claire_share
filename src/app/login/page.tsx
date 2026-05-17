"use client";

import { useState, FormEvent } from "react";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setError(data.error ?? "暗號錯誤！再想想看？");
        setPasscode("");
      }
    } catch {
      setError("連線錯誤，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[402px] mx-auto px-6 py-10 flex flex-col items-center">
        {/* 標題 */}
        <h1 className="text-4xl font-black leading-tight text-purple-800 mb-1 text-center">
          Claire&apos;s<br />Pocket Moments
        </h1>
        <p className="text-pink-600 mt-1 text-base font-semibold mb-6 text-center">
          最溫柔的陪伴💖
        </p>

        {/* 貼圖 */}
        <div className="flex justify-center mb-8">
          <img
            src="/stickers/sticker4-rm-bg.png"
            alt=""
            className="w-16 h-16 object-contain"
            style={{ transform: "scaleX(-1)" }}
          />
          <img
            src="/stickers/sticker1-rm-bg.png"
            alt=""
            className="w-16 h-16 object-contain mx-3"
          />
          <img
            src="/stickers/sticker6-rm-bg.png"
            alt=""
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* 登入卡片 */}
        <div className="w-full bg-white/60 rounded-3xl p-6 shadow-sm">
          <p className="text-center text-purple-700 font-semibold mb-4 text-sm">
            請輸入你的專屬暗號 🔐
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="輸入暗號…"
              autoFocus
              disabled={loading}
              className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-gray-700 placeholder-gray-300 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
            />
            {error && (
              <p className="text-center text-red-500 text-sm font-medium">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || passcode.trim() === ""}
              className="w-full rounded-xl bg-pink-400 hover:bg-pink-500 disabled:opacity-50 text-white font-bold py-3 transition-colors shadow-sm"
            >
              {loading ? "驗證中…" : "進入 ✨"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
