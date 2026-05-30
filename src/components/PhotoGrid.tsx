"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { PhotoMeta } from "@/app/api/photos/route";
import type { Comment } from "@/app/api/comments/route";
import { getPhotoImageUrls, getPostKey, hasMultipleImages } from "@/lib/photo-post";

// ── 貼圖清單（檔名對應 public/stickers/ 目錄）──
const STICKERS = ["sticker1-rm-bg.png",
  "sticker2-rm-bg.png",
  "sticker3-rm-bg.png",
  "sticker4-rm-bg.png",
  "sticker5-rm-bg.png",
  "sticker6-rm-bg.png",
  "sticker7-rm-bg.png"];
// ───────────────────────────────────────────────

const STICKER_PREFIX = "[sticker:";

function isStickerText(text: string) {
  return text.startsWith(STICKER_PREFIX) && text.endsWith("]");
}
function stickerFile(text: string) {
  return text.slice(STICKER_PREFIX.length, -1);
}

function Avatar({ name }: { name: string }) {
  const letter = name?.charAt(0)?.toUpperCase() || "A";
  return (
    <div className="w-9 h-9 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
      <span className="text-purple-700 font-semibold text-sm">{letter}</span>
    </div>
  );
}

function ImageCarousel({ imageUrls, title }: { imageUrls: string[]; title: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full aspect-[4/3] bg-gray-100 shrink-0 overflow-hidden">
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {imageUrls.map((url, index) => (
            <div key={url} className="relative min-w-0 flex-[0_0_100%] h-full">
              <Image src={url} alt={`${title || "照片"} ${index + 1}`} fill className="object-cover" sizes="384px" />
            </div>
          ))}
        </div>
      </div>

      {imageUrls.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/50 transition-colors"
            aria-label="上一張照片"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/50 transition-colors"
            aria-label="下一張照片"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${index === selectedIndex ? "bg-white" : "bg-white/45"}`}
                aria-label={`前往第 ${index + 1} 張照片`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CommentSection({ postKey, imageUrl, comments, onCommentsUpdate, displayName }: { postKey: string; imageUrl: string; comments: Comment[]; onCommentsUpdate: (c: Comment[]) => void; displayName: string }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function postComment(commentText: string) {
    if (!commentText.trim()) return;
    setSubmitting(true);
    setStickerOpen(false);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: postKey, imageUrl, author: displayName, text: commentText }),
    });
    const data = await res.json();
    onCommentsUpdate(data.comments ?? []);
    setText("");
    setSubmitting(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await postComment(text);
  }

  async function sendSticker(filename: string) {
    await postComment(`${STICKER_PREFIX}${filename}]`);
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
                {isStickerText(c.text) ? (
                  <div className="mt-1">
                    <Image
                      src={`/stickers/${stickerFile(c.text)}`}
                      alt="sticker"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-snug">{c.text}</p>
                )}
                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(c.createdAt).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* 貼圖選單 */}
      {stickerOpen && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-2xl">
          {STICKERS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={submitting}
              onClick={() => sendSticker(s)}
              className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-pink-100 transition-colors disabled:opacity-40"
            >
              <Image src={`/stickers/${s}`} alt={s} width={48} height={48} className="object-contain" />
            </button>
          ))}
        </div>
      )}

      {/* 輸入區：單排 select + sticker + input + button */}
      <form onSubmit={submit} className="flex gap-2 items-center">
        <div className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-semibold bg-gray-50 shrink-0 whitespace-nowrap">
          {displayName || "…"}
        </div>
        <button
          type="button"
          onClick={() => setStickerOpen((v) => !v)}
          className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${stickerOpen ? "bg-pink-100 border-pink-300" : "border-gray-200 bg-white hover:bg-pink-50"}`}
          aria-label="貼圖"
        >
          🩷
        </button>
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

export default function PhotoFeed({ photos, initialComments, displayName }: { photos: PhotoMeta[]; initialComments: Record<string, Comment[]>; displayName: string }) {
  const [selected, setSelected] = useState<PhotoMeta | null>(null);
  const [visible, setVisible] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(initialComments);

  function updateComments(postKey: string, comments: Comment[]) {
    setCommentsMap((prev) => ({ ...prev, [postKey]: comments }));
  }

  function open(photo: PhotoMeta) {
    setSelected(photo);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }

  function close() {
    setVisible(false);
    setTimeout(() => setSelected(null), 300);
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {photos.map((photo) => {
          const postKey = getPostKey(photo);
          const imageUrls = getPhotoImageUrls(photo);
          const previewUrl = imageUrls[0];
          const lastComment = (commentsMap[postKey] ?? []).at(-1);

          return (
            <div
              key={postKey}
              className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => open(photo)}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar name={photo.uploader || photo.title} />
                <span className="text-sm font-medium text-gray-700">
                  {photo.uploader || "未知"}
                </span>
              </div>
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                {previewUrl && <Image src={previewUrl} alt={photo.title} fill className="object-cover" sizes="384px" />}
                {hasMultipleImages(photo) && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2 py-1 text-xs font-semibold text-white">
                    ⧉ {imageUrls.length}
                  </span>
                )}
              </div>
              <div className="px-4 py-3">
                <p className="font-bold text-gray-800 text-base">{photo.title || "無標題"}</p>
                {photo.description && <p className="text-gray-500 text-sm mt-1 leading-relaxed">{photo.description}</p>}
              </div>
              {lastComment && (
                <div className="px-4 pb-2 pt-2 flex gap-2 items-center bg-gray-100">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-purple-500 mr-1">{lastComment.author}</span>
                    {isStickerText(lastComment.text) ? (
                      <Image
                        src={`/stickers/${stickerFile(lastComment.text)}`}
                        alt="sticker"
                        width={28}
                        height={28}
                        className="inline object-contain align-middle"
                      />
                    ) : (
                      <span className="text-xs text-gray-500 truncate">{lastComment.text}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {selected && (
        (() => {
          const postKey = getPostKey(selected);
          const imageUrls = getPhotoImageUrls(selected);

          return (
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
            <ImageCarousel imageUrls={imageUrls} title={selected.title} />

            {/* 可捲動內容 */}
            <div className="overflow-y-auto flex-1">
              <div className="px-5 pt-4 pb-2">
                <h2 className="text-lg font-bold text-gray-800">{selected.title || "無標題"}</h2>
                {selected.description && <p className="mt-1 text-gray-500 text-sm leading-relaxed">{selected.description}</p>}
                <p className="mt-1 text-xs text-gray-300">{new Date(selected.uploadedAt).toLocaleString("zh-TW")}</p>
              </div>

              <CommentSection postKey={postKey} imageUrl={selected.imageUrl} comments={commentsMap[postKey] ?? []} onCommentsUpdate={(c) => updateComments(postKey, c)} displayName={displayName} />
            </div>


          </div>
        </div>
          );
        })()
      )}
    </>
  );
}
