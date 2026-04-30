"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import PhotoFeed from "@/components/PhotoGrid";
import Countdown from "@/components/Countdown";
import type { PhotoMeta } from "@/app/api/photos/route";
import type { Comment } from "@/app/api/comments/route";

function toLocalDateStr(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayStr(): string {
  return toLocalDateStr(new Date().toISOString());
}

function formatMenuDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });
}

export default function HomeClient({
  photos,
  initialComments,
}: {
  photos: PhotoMeta[];
  initialComments: Record<string, Comment[]>;
}) {
  const today = todayStr();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 取得所有有照片的日期（排序新到舊）
  const availableDates = Array.from(
    new Set(photos.map((p) => toLocalDateStr(p.uploadedAt)))
  ).sort((a, b) => b.localeCompare(a));

  // 目前顯示的照片
  const filtered = photos.filter((p) => toLocalDateStr(p.uploadedAt) === selectedDate);
  const isToday = selectedDate === today;

  // 點外側關閉 menu
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <main className="min-h-screen">
      <div className="max-w-[402px] mx-auto px-4 pt-10 pb-6">

        {/* 標題與 menu */}
        <div className="relative flex items-start justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-black leading-tight text-purple-800 mb-2">
              Claire's<br/>Pocket Moments
            </h1>
            <Countdown />
          </div>

          {/* 右上角 menu 按鈕 */}
          <div className="absolute right-0 top-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 transition-colors shadow-sm text-gray-700 text-lg"
              aria-label="選擇日期"
            >
              ☰
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl overflow-hidden z-20">
                <p className="text-xs text-gray-400 font-semibold px-4 pt-3 pb-1 uppercase tracking-wide">選擇日期</p>
                {availableDates.length === 0 ? (
                  <p className="text-sm text-gray-300 px-4 py-3">還沒有任何照片</p>
                ) : (
                  availableDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => { setSelectedDate(date); setMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-pink-50 ${
                        date === selectedDate ? "font-bold text-pink-500" : "text-gray-700"
                      }`}
                    >
                      {date === today ? `今天（${formatMenuDate(date)}）` : formatMenuDate(date)}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* 只有看今天才顯示上傳按鈕 */}
        {isToday && (
          <Link
            href="/upload"
            className="mt-6 flex items-center justify-center w-full bg-white/60 hover:bg-white/80 rounded-full py-3 transition-colors shadow-sm"
          >
            <span className="text-2xl font-light text-pink-500">＋</span>
          </Link>
        )}

        {/* 非今天時顯示日期標籤 */}
        {!isToday && (
          <div className="mt-6 flex items-center justify-between bg-white/40 px-4 py-2 rounded-xl">
            <span className="text-pink-600 font-semibold text-base">
              {formatMenuDate(selectedDate)}
            </span>
            <button
              onClick={() => setSelectedDate(today)}
              className="text-pink-500 font-medium text-sm hover:text-pink-700 bg-white/60 px-3 py-1 rounded-lg transition-colors"
            >
              回今天
            </button>
          </div>
        )}

        {/* 照片 feed */}
        <div className="mt-6">
          {filtered.length === 0 && isToday ? (
            <p className="text-center text-pink-400 py-16 text-sm font-medium">
              來上傳今天的第一張照片吧！
            </p>
          ) : (
            <PhotoFeed photos={filtered} initialComments={initialComments} />
          )}
        </div>
      </div>
    </main>
  );
}
