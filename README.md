# Claire Share

私人相簿網站，支援照片上傳、留言（含貼圖）、依日期瀏覽，並有倒數計時器。

## 技術棧

- **Next.js 16** (App Router, TypeScript)
- **Vercel Blob** — 儲存圖片、metadata、留言
- **Tailwind CSS**
- **Vercel** — 部署

---

## 本地開發

```powershell
npm install
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)。

`.env.local` 需要包含：

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxx
```

Token 可從 Vercel Dashboard → Storage → Blob → `.env.local` 取得。

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
| `list-photos` | 列出所有照片（含上傳者、時間、URL） |
| `list-comments` | 列出所有留言（含貼圖） |
| `set-uploader <imageUrl> <name>` | 修改照片的上傳者名稱 |
| `set-uploaded-at <imageUrl> <datetime>` | 修改照片的上傳時間 |
| `delete-photo <imageUrl>` | 刪除照片及其 metadata、留言 |
| `delete-comment <imageUrl> <index>` | 刪除指定照片的第 N 則留言（從 0 開始） |

### 範例

```powershell
# 列出所有照片，取得 imageUrl
npx tsx scripts/blob-admin.ts list-photos

# 修改上傳者
npx tsx scripts/blob-admin.ts set-uploader https://xxx.blob.vercel-storage.com/photos/123.png 伴伴

# 修改上傳時間（會決定照片出現在哪一天）
npx tsx scripts/blob-admin.ts set-uploaded-at https://xxx.blob.vercel-storage.com/photos/123.png "2026-05-01 20:30"

# 刪除照片的第 0 則留言
npx tsx scripts/blob-admin.ts delete-comment https://xxx.blob.vercel-storage.com/photos/123.png 0
```

> `datetime` 接受任何 JS 可解析格式，例如 `"2026-05-01 20:30"` 或 `"2026-05-01T20:30:00+08:00"`。

