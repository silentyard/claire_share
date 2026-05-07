"use client";

import { useState, useRef, useEffect } from "react";
import type { Fortune } from "@/data/fortunes";

interface Props {
  fortune: Fortune | null;
}

export default function FortuneAvatar({ fortune }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when tapping outside
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

  if (!fortune) return null;

  const buttonSrc = open ? "/gaga-fortune-open.png" : "/gaga-fortune-close.png";
  return (
    <div ref={wrapperRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Tooltip bubble */}
      {open && (
        <div
            className="w-56 rounded-2xl shadow-xl p-4 text-sm mb-4"
            style={{
                backgroundColor: 'white',
                color: fortune.textColor,
                // speech-bubble tail pointing down-right
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
            {/* Tail */}
                <p className="font-bold text-2xl text-center mb-1">今日運勢</p>
                <p className="font-extrabold text-xl text-center mb-2">{fortune.level}</p>
                <p className="leading-snug mb-3">{fortune.description}</p>
                <p className="text-xs">
                    幸運色：{fortune.luckyColor}
                </p>
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
        onClick={() => setOpen((v) => !v)}
        className="fortune-avatar-btn"
        aria-label="今日運勢"
      >
        <img src={buttonSrc} alt="Fortune Avatar" className="w-4/5 h-4/5 object-cover rounded-full fortune-avatar-img" />
      </button>
    </div>
  );
}
