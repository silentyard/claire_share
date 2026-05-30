# Claire's Pocket Moments

柔柔與伴伴的私人相簿。支援多照片貼文、留言（含貼圖）、依日期瀏覽，並以暗號登入保護全站。

## 技術棧

- **Next.js 16** (App Router, TypeScript)
- **Vercel Blob** — 儲存圖片、metadata、留言
- **Tailwind CSS v4**
- **@daypicker/react** — 日期選擇器月曆
- **Embla Carousel** — 多照片貼文左右滑動瀏覽
- **Vercel** — 部署

---

## 本地開發

```powershell
npm install
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)。

`.env.local` 需要包含以下欄位（範本見 `.env.local`）：

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxx
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app

PASSCODE_CLAIRE=柔柔的暗號
PASSCODE_PARTNER=伴伴的暗號
COOKIE_SECRET=至少32字元的隨機字串
```

- `BLOB_READ_WRITE_TOKEN`：Vercel Dashboard → Storage → Blob → `.env.local` 取得
- `COOKIE_SECRET`：可用 `openssl rand -base64 32` 產生

---

## 登入機制

全站以 Next.js Middleware 保護，未登入一律導向 `/login`。

- 兩組獨立暗號，分別對應柔柔（`PASSCODE_CLAIRE`）和伴伴（`PASSCODE_PARTNER`）
- 驗證成功後寫入 HMAC-SHA256 簽名的 httpOnly cookie，有效期 30 天
- 需在 Vercel Dashboard → Settings → Environment Variables 同步設定上述三個 env vars

---

## 主要功能

- **相簿瀏覽** — 依日期篩選，月曆選日期（只有有照片的日期可選）
- **照片上傳** — 支援單張或多張照片，逐張壓縮（每張自動縮小至 3 MB 以下），上傳者自動帶入登入身份
- **多照片貼文** — 貼文卡片顯示張數，點開後可像 Instagram 一樣左右滑動瀏覽
- **留言** — 文字或貼圖，作者自動帶入登入身份
- **今日運勢** — 浮動 avatar，每日隨機籤詩

---

## 資料模型備註

新貼文 metadata 會包含：

- `postId`：貼文識別碼，也是新留言的主要 key
- `imageUrl`：第一張照片 URL，保留給舊程式碼相容
- `imageUrls`：貼文內所有照片 URL

舊資料如果沒有 `postId` / `imageUrls` 仍可正常顯示；程式會 fallback 到 `imageUrl`。留言也支援舊的 `imageUrl` key，未來若要正式 migrate，只要把舊 metadata 補上 `postId` / `imageUrls` 並搬移留言 key 即可。

---

## 新增貼圖

1. 把 PNG 放進 `public/stickers/`
2. 在 `src/components/PhotoGrid.tsx` 的 `STICKERS` 陣列加上對應的檔名

---

## Blob 管理腳本

使用 `scripts/blob-admin.ts` 可以直接操作 Vercel Blob 中的資料，不需要手動進 Dashboard。

```powershell
npx tsx scripts/blob-admin.ts <command>
```

### 指令一覧

| 指令 | 說明 |
|------|------|
| `list-photos` | 列出所有貼文（含 postId、上傳者、時間、所有圖片 URL） |
| `list-comments` | 列出所有留言（含貼圖與 comment key） |
| `set-uploader <postId\|imageUrl> <name>` | 修改貼文的上傳者名稱 |
| `set-uploaded-at <postId\|imageUrl> <datetime>` | 修改貼文的上傳時間 |
| `delete-photo <postId\|imageUrl>` | 刪除貼文及其所有圖片、metadata、留言 |
| `delete-comment <postId\|imageUrl> <index>` | 刪除指定貼文的第 N 則留言（從 0 開始） |

### 範例

```powershell
# 列出所有貼文，取得 postId 或 imageUrl
npx tsx scripts/blob-admin.ts list-photos

# 修改上傳者
npx tsx scripts/blob-admin.ts set-uploader 1717130000000 伴伴

# 修改上傳時間（會決定照片出現在哪一天）
npx tsx scripts/blob-admin.ts set-uploaded-at 1717130000000 "2026-05-01 20:30"

# 刪除照片的第 0 則留言
npx tsx scripts/blob-admin.ts delete-comment 1717130000000 0
```

> `datetime` 接受任何 JS 可解析格式，例如 `"2026-05-01 20:30"` 或 `"2026-05-01T20:30:00+08:00"`。
