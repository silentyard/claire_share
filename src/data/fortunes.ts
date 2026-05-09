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
  },
  "2026-05-09": {
    level: "我獨自升吉",
    description:
      "宜放慢腳步，忌回工作訊息。週末終於到了！把照顧別人的雷達暫時關閉，今天妳只需要好好寵愛自己，享受沒有行程的早晨。",
    luckyColor: "淡雅紫",
    luckyColorHex: "#E8D7FF",
    luckyNumber: 5,
    textColor: "#b86500",
  },
  "2026-05-10": {
    level: "To: 柔柔",
    description:
      `這段話完全是伴伴自己打出來的。每天最幸運的事，是看到柔柔分享的照片、是晚上看到柔柔漂漂的臉臉，還有通著電話一起入眠。
      這禮拜從一開始熬夜趕報告，到中間可以暫時鬆一口氣，再到最後越來越多睡覺、出遊。
      柔柔完美完成了這次出差的任務，終於可以回來休息、跟伴伴團聚了。
      我一開始還很擔心柔柔不會喜歡這個網站呢，沒想到每天都有好多好多的照片。
      現在回頭看，這些點滴真的很美，都是我們兩個共同完成的回憶呢~。
      馬上就要回來了，伴伴好想妳呀！快回來吧！來抱抱~🤭🤭🤭`,
    luckyColor: "純白",
    luckyColorHex: "#ffffff",
    luckyNumber: 520,
    textColor: "#9a005f",
  },
};
// ────────────────────────────────────────────────────────────────────────────

export function getFortune(dateStr: string): Fortune | null {
  return FORTUNES[dateStr] ?? null;
}
