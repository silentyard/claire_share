"use client";

import { useState } from "react";
import Image from "next/image";
import type { PhotoMeta } from "@/app/api/photos/route";

function Avatar({ name }: { name: string }) {
  const letter = name?.charAt(0)?.toUpperCase() || "A";
  return (
    <div className="w-9 h-9 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
      <span className="text-purple-700 font-semibold text-sm">{letter}</span>
    </div>
  );
}

export default function PhotoFeed({ photos }: { photos: PhotoMeta[] }) {
  const [selected, setSelected] = useState<PhotoMeta | null>(null);

  if (photos.length === 0) {
    return (
      <p className="text-center text-white/70 py-16 text-sm">
        還沒有照片，點上方 ＋ 上傳第一張吧！
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {photos.map((photo) => (
          <div
            key={photo.imageUrl}
            className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setSelected(photo)}
          >
            {/* 卡片 header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar name={photo.title} />
              <span className="text-sm font-medium text-gray-500">
                {new Date(photo.uploadedAt).toLocaleDateString("zh-TW", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* 照片 */}
            <div className="relative w-full aspect-[4/3] bg-gray-100">
              <Image
                src={photo.imageUrl}
                alt={photo.title}
                fill
                className="object-cover"
                sizes="(max-width: 384px) 100vw, 384px"
              />
            </div>

            {/* 文字 */}
            <div className="px-4 py-3">
              <p className="font-bold text-gray-800 text-base">{photo.title || "無標題"}</p>
              {photo.description && (
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{photo.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-sm pb-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[4/3] bg-gray-100">
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                className="object-cover"
                sizes="384px"
              />
            </div>
            <div className="px-5 pt-4">
              <h2 className="text-xl font-bold text-gray-800">{selected.title}</h2>
              {selected.description && (
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{selected.description}</p>
              )}
              <p className="mt-3 text-xs text-gray-400">
                {new Date(selected.uploadedAt).toLocaleString("zh-TW")}
              </p>
              <button
                onClick={() => setSelected(null)}
                className="mt-5 w-full py-3 rounded-full bg-gray-100 text-gray-600 text-sm font-medium"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
