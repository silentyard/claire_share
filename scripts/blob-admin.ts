/**
 * blob-admin.ts — 用來直接操作 Vercel Blob 的本地工具腳本
 *
 * 使用方式：
 *   npx tsx scripts/blob-admin.ts <command> [options]
 *
 * 指令：
 *   list-photos                        列出所有照片 metadata
 *   list-comments                      列出所有留言
 *   set-uploader <postId|imageUrl> <name> 把指定貼文的 uploader 欄位設定為 name
 *   backfill-uploader <name>           把所有沒有 uploader 的照片都補上 name
 *   delete-photo <postId|imageUrl>     刪除貼文及其 metadata / 留言
 *   delete-comment <postId|imageUrl> <index>  刪除指定貼文的第 N 則留言（從 0 開始）
 */

import { list, put, del } from "@vercel/blob";
import { readFileSync } from "fs";
import { getPhotoImageUrls, getPostKey } from "../src/lib/photo-post";
import { decodeCommentStorageId, getCommentBlobPath } from "../src/lib/server-comment-keys";
import type { PhotoMeta } from "../src/lib/photo-post";

// Load .env.local manually (avoids needing dotenv as a dependency)
try {
  const env = readFileSync(".env.local", "utf-8");
  for (const line of env.split("\n")) {
    const match = /^([^#=]+)=(.*)$/.exec(line.trim());
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch { /* .env.local not found, rely on existing env */ }

// ─── helpers ─────────────────────────────────────────────────────────────────

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
}

async function getAllMeta() {
  const { blobs } = await list({ prefix: "photos/", limit: 500 });
  const metaBlobs = blobs.filter((b) => b.pathname.endsWith(".meta.json"));
  return Promise.all(
    metaBlobs.map(async (b) => ({ blob: b, meta: await fetchJson(b.url) as PhotoMeta }))
  );
}

async function findPost(identifier: string) {
  const items = await getAllMeta();
  const found = items.find(({ meta }) => {
    const urls = getPhotoImageUrls(meta);
    return getPostKey(meta) === identifier || urls.includes(identifier);
  });

  if (!found) {
    console.error("找不到該貼文的 metadata");
    process.exit(1);
  }

  return found;
}

async function findCommentBlob(storageId: string) {
  const key = getCommentBlobPath(storageId).replace(/\.json$/, "");
  const { blobs } = await list({ prefix: key });
  return blobs[0];
}

// ─── commands ────────────────────────────────────────────────────────────────

async function listPhotos() {
  const items = await getAllMeta();
  if (items.length === 0) { console.log("（沒有照片）"); return; }
  for (const { meta } of items) {
    const urls = getPhotoImageUrls(meta);
    console.log(`${meta.uploadedAt}  [${meta.uploader ?? "（無）"}]  ${meta.title}`);
    console.log(`  postId: ${meta.postId ?? "（legacy）"}`);
    console.log(`  images: ${urls.length}`);
    for (const [index, url] of urls.entries()) {
      console.log(`    [${index}] ${url}`);
    }
    console.log();
  }
}

async function listComments() {
  const { blobs } = await list({ prefix: "comments/", limit: 500 });
  const commentBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));
  if (commentBlobs.length === 0) { console.log("（沒有留言）"); return; }
  for (const b of commentBlobs) {
    const comments = await fetchJson(b.url);
    console.log(`${b.pathname}  key=${decodeCommentStorageId(b.pathname)}  (${comments.length} 則)`);
    for (const [i, c] of comments.entries()) {
      const stickerMatch = /^\[sticker:(.+)\]$/.exec(c.text);
      const display = stickerMatch ? `[貼圖: ${stickerMatch[1]}]` : c.text;
      console.log(`  [${i}] ${c.author} @ ${c.createdAt}: ${display}`);
    }
    console.log();
  }
}

async function setUploader(identifier: string, name: string) {
  const found = await findPost(identifier);
  const updated = { ...found.meta, uploader: name };
  await put(found.blob.pathname, JSON.stringify(updated), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
  console.log(`✅ 已將 "${found.meta.title}" 的 uploader 設為 "${name}"`);
}

async function setUploadedAt(imageUrl: string, datetime: string) {
  // datetime: 接受任何 JS 可解析的格式，例如 "2026-05-01 20:30" 或 ISO string
  const parsed = new Date(datetime);
  if (isNaN(parsed.getTime())) {
    console.error(`無法解析時間："${datetime}"`);
    console.error(`  請使用格式如 "2026-05-01 20:30" 或 "2026-05-01T20:30:00+08:00"`);
    process.exit(1);
  }
  const found = await findPost(imageUrl);
  const updated = { ...found.meta, uploadedAt: parsed.toISOString() };
  await put(found.blob.pathname, JSON.stringify(updated), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
  console.log(`✅ 已將 "${found.meta.title}" 的上傳時間改為 ${parsed.toISOString()}`);
}

async function deletePhoto(identifier: string) {
  const found = await findPost(identifier);
  const postKey = getPostKey(found.meta);
  const imageUrls = getPhotoImageUrls(found.meta);

  // Delete image, meta, and comments
  await del(imageUrls);
  await del(found.blob.url);
  const postCommentBlob = await findCommentBlob(postKey);
  if (postCommentBlob) await del(postCommentBlob.url);
  const legacyCommentBlob = await findCommentBlob(found.meta.imageUrl);
  if (legacyCommentBlob && legacyCommentBlob.url !== postCommentBlob?.url) await del(legacyCommentBlob.url);

  console.log(`🗑️ 已刪除 "${found.meta.title}" 及其所有資料。`);
}

async function deleteComment(identifier: string, index: number) {
  const found = await findPost(identifier);
  const blob = await findCommentBlob(getPostKey(found.meta)) ?? await findCommentBlob(found.meta.imageUrl);
  if (!blob) { console.error("找不到該貼文的留言"); process.exit(1); }
  const comments: unknown[] = await fetchJson(blob.url);
  if (index < 0 || index >= comments.length) {
    console.error(`index 超出範圍（共 ${comments.length} 則）`);
    process.exit(1);
  }
  const removed = comments.splice(index, 1)[0] as { author: string; text: string };
  await put(blob.pathname, JSON.stringify(comments), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
  console.log(`🗑️ 已刪除第 ${index} 則留言（${removed.author}: ${removed.text}）`);
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  switch (cmd) {
    case "list-photos":       await listPhotos(); break;
    case "list-comments":     await listComments(); break;
    case "set-uploader":      await setUploader(args[0], args[1]); break;
    case "set-uploaded-at":   await setUploadedAt(args[0], args.slice(1).join(" ")); break;
    case "delete-photo":      await deletePhoto(args[0]); break;
    case "delete-comment":    await deleteComment(args[0], Number(args[1])); break;
    default:
      console.log(`
用法: npx tsx scripts/blob-admin.ts <command>

  list-photos
  list-comments
  set-uploader <postId|imageUrl> <name>
  set-uploaded-at <postId|imageUrl> <datetime>   例："2026-05-01 20:30"
  delete-photo <postId|imageUrl>
  delete-comment <postId|imageUrl> <index>
`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
