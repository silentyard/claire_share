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
  "2026-05-05": {
    level: "大大吉",
    description:
      "宜團隊交流，忌過度客氣。魅力爆棚！妳的感染力能順利推進進度，晚上記得吃頓好的！",
    luckyColor: "日本米白色",
    luckyColorHex: "#f5f5dc",
    luckyNumber: 12,
    textColor: "#6E5E2E",
  },
  "2026-05-06": {
    level: "娃娃·吉",
    description:
      "宜偷懶，忌熬夜。今天有滿滿溫暖能量！妳的體貼能化解工作小阻礙，但也別忘了照顧自己喔！",
    luckyColor: "柔柔粉紅色",
    luckyColorHex: "#f8caf0",
    luckyNumber: 1,
    textColor: "#b80019",
  },
  "2026-05-07": {
    level: "十萬火吉",
    description:
      "宜展現親和力，忌獨自扛責任。妳溫暖的笑容是破冰最佳武器。遇到難題記得尋求支援，別把壓力全往肩上攬喔！",
    luckyColor: "霧橘色",
    luckyColorHex: "#ffd9a1",
    luckyNumber: 9,
    textColor: "#7c0000",
  },
  "2026-05-08": {
    level: "心臟爆吉 ><",
    description:
      "宜吃頓大餐，忌虧待胃口。放假就是要吃好吃的！澳洲龍蝦，我來了！用滿滿的美食撫慰這週出差的辛勞吧！",
    luckyColor: "天空藍",
    luckyColorHex: "#8CEDFF",
    luckyNumber: 18,
    textColor: "#c76d00",
  }
};
// ────────────────────────────────────────────────────────────────────────────

export function getFortune(dateStr: string): Fortune | null {
  return FORTUNES[dateStr] ?? null;
}
