"use client";

import { useState } from "react";
import Image from "next/image";
import type { PhotoMeta } from "@/app/api/photos/route";

export default function PhotoGrid({ photos }: { photos: PhotoMeta[] }) {
  const [selected, setSelected] = useState<PhotoMeta | null>(null);

  if (photos.length === 0) {
    return (
      <p className="text-center text-gray-400 py-20">
        還沒有照片，快去上傳第一張吧！
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.imageUrl}
            className="cursor-pointer group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => setSelected(photo)}
          >
            <Image
              src={photo.imageUrl}
              alt={photo.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm font-medium truncate">{photo.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-video bg-gray-100">
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                className="object-contain"
                sizes="672px"
              />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-800">{selected.title}</h2>
              {selected.description && (
                <p className="mt-2 text-gray-600 whitespace-pre-wrap">{selected.description}</p>
              )}
              <p className="mt-3 text-xs text-gray-400">
                {new Date(selected.uploadedAt).toLocaleString("zh-TW")}
              </p>
              <button
                onClick={() => setSelected(null)}
                className="mt-4 text-sm text-blue-500 hover:underline"
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
