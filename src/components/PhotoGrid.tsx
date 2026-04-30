"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { PhotoMeta } from "@/app/api/photos/route";
import type { Comment } from "@/app/api/comments/route";

// ── 可自行修改成員名單 ──────────────────────────
const MEMBERS = ["柔柔", "伴伴"];
// ───────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const letter = name?.charAt(0)?.toUpperCase() || "A";
  return (
    <div className="w-9 h-9 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
      <span className="text-purple-700 font-semibold text-sm">{letter}</span>
    </div>
  );
}

function CommentSection({ imageUrl, initialComments }: { imageUrl: string; initialComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [author, setAuthor] = useState(MEMBERS[0]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, author, text }),
    });
    const updated = await fetch(`/api/comments?imageUrl=${encodeURIComponent(imageUrl)}`).then((r) => r.json());
    setComments(updated.comments ?? []);
    setText("");
    setSubmitting(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  return (
    <div className="px-5 py-4 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">留言</p>

      {/* 留言列表 */}
      {comments.length === 0 ? (
        <p className="text-xs text-gray-300 mb-3">還沒有留言</p>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Avatar name={c.author} />
              <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-purple-600">{c.author}</p>
                <p className="text-sm text-gray-700 leading-snug">{c.text}</p>
                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(c.createdAt).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* 輸入區：單排 select + input + button */}
      <form onSubmit={submit} className="flex gap-2 items-center">
        <select
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="border border-gray-200 rounded-xl px-2 py-2 text-sm text-gray-800 [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white shrink-0"
        >
          {MEMBERS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="說點什麼…"
          className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="bg-pink-400 hover:bg-pink-500 disabled:opacity-40 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors shrink-0"
        >
          送出
        </button>
      </form>
    </div>
  );
}

export default function PhotoFeed({ photos, initialComments }: { photos: PhotoMeta[]; initialComments: Record<string, Comment[]> }) {
  const [selected, setSelected] = useState<PhotoMeta | null>(null);
  const [visible, setVisible] = useState(false);

  function open(photo: PhotoMeta) {
    setSelected(photo);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }

  function close() {
    setVisible(false);
    setTimeout(() => setSelected(null), 300);
  }

  if (photos.length === 0) {
    return <p className="text-center text-white/70 py-16 text-sm">還沒有照片，點上方 ＋ 上傳第一張吧！</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {photos.map((photo) => (
          <div
            key={photo.imageUrl}
            className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => open(photo)}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar name={photo.title} />
              <span className="text-sm font-medium text-gray-500">
                {new Date(photo.uploadedAt).toLocaleDateString("zh-TW", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="relative w-full aspect-[4/3] bg-gray-100">
              <Image src={photo.imageUrl} alt={photo.title} fill className="object-cover" sizes="384px" />
            </div>
            <div className="px-4 py-3">
              <p className="font-bold text-gray-800 text-base">{photo.title || "無標題"}</p>
              {photo.description && <p className="text-gray-500 text-sm mt-1 leading-relaxed">{photo.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: visible ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0)", transition: "background-color 0.3s" }}
          onClick={close}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[90vh] flex flex-col relative"
            style={{
              transform: visible ? "scale(1)" : "scale(0.92)",
              opacity: visible ? 1 : 0,
              transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 右上角 X 按鈕 */}
            <button
              onClick={close}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              aria-label="關閉"
            >
              ✕
            </button>

            {/* 圖片：無任何 padding，直接貼頂 */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 shrink-0">
              <Image src={selected.imageUrl} alt={selected.title} fill className="object-cover" sizes="384px" />
            </div>

            {/* 可捲動內容 */}
            <div className="overflow-y-auto flex-1">
              <div className="px-5 pt-4 pb-2">
                <h2 className="text-lg font-bold text-gray-800">{selected.title || "無標題"}</h2>
                {selected.description && <p className="mt-1 text-gray-500 text-sm leading-relaxed">{selected.description}</p>}
                <p className="mt-1 text-xs text-gray-300">{new Date(selected.uploadedAt).toLocaleString("zh-TW")}</p>
              </div>

              <CommentSection imageUrl={selected.imageUrl} initialComments={initialComments[selected.imageUrl] ?? []} />
            </div>


          </div>
        </div>
      )}
    </>
  );
}
