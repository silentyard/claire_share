"use client";

import { useEffect, useState } from "react";

// 目標時間：2026-05-11 08:00 GMT+8
const TARGET = new Date("2026-05-11T08:00:00+08:00").getTime();
const LABEL = "5/11";

function calcParts(now: number) {
  const diff = Math.max(0, TARGET - now);
  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { d, h, m, s, done: diff === 0 };
}

export default function Countdown() {
  const [parts, setParts] = useState(() => calcParts(Date.now()));

  useEffect(() => {
    const id = setInterval(() => setParts(calcParts(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  if (parts.done) {
    return <p className="text-pink-600 mt-1 text-base font-semibold">🎉 到啦！</p>;
  }

  return (
    <p className="text-pink-600 mt-1 text-sm font-medium tracking-wide">
      距離 {LABEL} 還有{" "}
      <span className="font-bold">{parts.d}</span>d{" "}
      <span className="font-bold">{String(parts.h).padStart(2, "0")}</span>h{" "}
      <span className="font-bold">{String(parts.m).padStart(2, "0")}</span>m{" "}
      <span className="font-bold">{String(parts.s).padStart(2, "0")}</span>s
    </p>
  );
}
