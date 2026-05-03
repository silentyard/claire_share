export interface Fortune {
  level: string;          // e.g. "大吉", "小吉", "中吉"
  description: string;    // fortune body text
  luckyColor: string;     // color name in Chinese, e.g. "淡檸檬黃"
  luckyColorHex: string;  // used as the tooltip background, e.g. "#FAFFC0"
  luckyNumber: number;    // lucky number
  textColor: string;      // text color inside the tooltip, e.g. "#3a3a3a"
}

// ── Add new entries here ─────────────────────────────────────────────────────
// Key format: "YYYY-MM-DD"
const FORTUNES: Record<string, Fortune> = {
  "2026-05-04": {
    level: "大吉",
    description:
      "宜自信發言，忌鑽牛角尖。出差會議再多，也能憑清晰思緒完美破關！",
    luckyColor: "淡檸檬黃",
    luckyColorHex: "#FAFFC0",
    luckyNumber: 3,
    textColor: "#3a3320",
  },
};
// ────────────────────────────────────────────────────────────────────────────

export function getFortune(dateStr: string): Fortune | null {
  return FORTUNES[dateStr] ?? null;
}
