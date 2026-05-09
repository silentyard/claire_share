"use client";

import { useState, useRef, useEffect } from "react";
import { getFortune } from "@/data/fortunes";

// ── 5/10 解鎖遊戲設定 ─────────────────────────────
const GAME_DATE = "2026-05-10";
const UNLOCK_PASSWORD = "claire";
const UNLOCK_HINT = "還記得前幾天的幸運數字嗎？";
const UNLOCK_LOCAL_STORAGE_KEY = "fortune_unlocked_20260510";
const REQUIRED_UPLOADER = "柔柔";
const REQUIRED_PHOTOS_COUNT = 3;
// ─────────────────────────────────────────────────

interface Props {
  selectedDate: string;
}

function randomPosition(): { bottom: string; right: string } {
  // 保持在螢幕內，bottom 10~55vh，right 5~60vw
  const bottom = Math.floor(Math.random() * 45) + 10;
  const right = Math.floor(Math.random() * 55) + 5;
  return { bottom: `${bottom}vh`, right: `${right}vw` };
}

export default function FortuneAvatar({ selectedDate }: Props) {
  const isGameDay = selectedDate === GAME_DATE;

  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(UNLOCK_LOCAL_STORAGE_KEY) === "1";
  });

  const [open, setOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [position, setPosition] = useState({ bottom: "1.5rem", right: "1.5rem" });
  const [moving, setMoving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);

  // 點外面關閉 tooltip
  useEffect(() => {
    function handler(e: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const fortune = getFortune(selectedDate);
  if (fortune === null) {
    console.error(`No fortune found for date ${selectedDate}`);
    return null;
  }

  async function checkPhotos(): Promise<boolean> {
    const res = await fetch("/api/photos");
    const { photos } = await res.json();
    const count = (photos as { uploader?: string; uploadedAt: string }[]).filter(
      (p) => p.uploader === REQUIRED_UPLOADER && p.uploadedAt.startsWith(GAME_DATE)
    ).length;
    return count >= REQUIRED_PHOTOS_COUNT;
  }

  function doUnlock() {
    localStorage.setItem(UNLOCK_LOCAL_STORAGE_KEY, "1");
    setUnlocked(true);
    setShowModal(false);
    setClickCount(0);
    setPosition({ bottom: "1.5rem", right: "1.5rem" });
    setPassword("");
    setPwError("");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim().toLowerCase() === UNLOCK_PASSWORD) {
      doUnlock();
      return;
    }
    setPwError("密碼不對喔 🥺 提示：謎底是英文單字唷～");
  }

  function handleModalClose() {
    setShowModal(false);
    setPassword("");
    setPwError("");
    // 沒解鎖，回到第一階段
    setClickCount(0);
    setPosition({ bottom: "1.5rem", right: "1.5rem" });
  }

  function handleAvatarClick() {
    // 非遊戲日或已解鎖：正常開關運勢
    if (!isGameDay || unlocked) {
      setOpen((v) => !v);
      return;
    }

    const next = clickCount + 1;
    if (next <= 3) {
      setClickCount(next);
      setMoving(true);
      setPosition(randomPosition());
      setTimeout(() => setMoving(false), 600);
    } else {
      setClickCount(0);
      setShowModal(true);
    }
  }

  return (
    <>
      <div
        ref={wrapperRef}
        className="fixed z-40 flex flex-col items-end gap-2"
        style={{
          bottom: position.bottom,
          right: position.right,
          transition: moving
            ? "bottom 0.55s cubic-bezier(0.34,1.56,0.64,1), right 0.55s cubic-bezier(0.34,1.56,0.64,1)"
            : "none",
        }}
      >
        {/* Tooltip bubble（僅解鎖後或非遊戲日顯示）*/}
        {open && (!isGameDay || unlocked) && (
          <div
            className="w-56 rounded-2xl shadow-xl p-4 text-sm mb-4"
            style={{
              backgroundColor: "white",
              color: fortune.textColor,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
            }}
          >
            <div
              className="w-48 rounded-2xl p-4 text-sm mb-1"
              style={{
                backgroundColor: fortune.luckyColorHex,
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
              }}
            >
              <p className="font-bold text-2xl text-center mb-1">今日運勢</p>
              <p className="font-extrabold text-xl text-center mb-2">{fortune.level}</p>
              <p className="leading-snug mb-3">{fortune.description}</p>
              <p className="text-xs">幸運色：{fortune.luckyColor}</p>
              <p className="text-xs">幸運數字：{fortune.luckyNumber}</p>
            </div>
            <div
              className="absolute -bottom-3 right-6 w-0 h-0"
              style={{
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: `12px solid ${fortune.luckyColorHex}`,
              }}
            />
          </div>
        )}

        {/* Avatar button */}
        <button
          onClick={handleAvatarClick}
          className="fortune-avatar-btn"
          aria-label="今日運勢"
        >
          <img
            src="/karby-fortune-close.png"
            alt="Fortune Avatar"
            className="w-4/5 h-4/5 object-cover rounded-full fortune-avatar-img"
            style={{ display: open ? "none" : "block" }}
          />
          <img
            src="/karby-fortune-open.png"
            alt="Fortune Avatar"
            className="w-4/5 h-4/5 object-cover rounded-full fortune-avatar-img"
            style={{ display: open ? "block" : "none" }}
          />
        </button>
      </div>

      {/* 解鎖密碼 Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={handleModalClose}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-xs flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xl font-bold text-center text-pink-500">🔒 解鎖今日運勢 🔒</p>
            <div className="text-sm text-gray-500 text-center">{UNLOCK_HINT}</div>
            <div className="text-xs text-gray-500 text-center">{"如果時光可以倒轉...🤔"}</div>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPwError(""); }}
                placeholder="輸入密碼…"
                autoFocus
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-pink-300 text-center tracking-widest"
              />
              {pwError && <p className="text-xs text-red-400 text-center">{pwError}</p>}
              <button
                type="submit"
                disabled={!password.trim()}
                className="bg-pink-400 hover:bg-pink-500 disabled:opacity-40 text-white font-semibold py-2 rounded-xl transition-colors"
              >
                解鎖
              </button>
            </form>
            <button
              onClick={handleModalClose}
              className="text-xs text-gray-300 text-center hover:text-gray-400"
            >
              下次再說
            </button>
          </div>
        </div>
      )}
    </>
  );
}
