"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Compress an image File using Canvas before uploading.
// Target: ≤ 3 MB so we stay well under Vercel's 4.5 MB serverless body limit.
async function compressImage(file: File, maxBytes = 3 * 1024 * 1024): Promise<File> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      // Scale down if the image is very large (cap at 2048 px on longest side)
      const MAX_DIM = 2048;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) { height = Math.round((height / width) * MAX_DIM); width = MAX_DIM; }
        else { width = Math.round((width / height) * MAX_DIM); height = MAX_DIM; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      // Try decreasing quality until under maxBytes
      let quality = 0.85;
      const tryEncode = () => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          if (blob.size <= maxBytes || quality < 0.3) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            quality -= 0.1;
            tryEncode();
          }
        }, "image/jpeg", quality);
      };
      tryEncode();
    };
    img.src = objectUrl;
  });
}

export default function UploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploader, setUploader] = useState("柔柔");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function clearPreview() {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("請選擇一張照片");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("uploader", uploader);
      formData.append("title", title);
      formData.append("description", description);

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "上傳失敗，請再試一次");
        setUploading(false);
      }
    } catch (err) {
      setError((err as Error).message || "上傳失敗，請再試一次");
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* File picker */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => !preview && fileRef.current?.click()}
      >
        {preview ? (
          <div className="relative mx-auto w-full max-w-sm aspect-video">
            <Image src={preview} alt="preview" fill className="object-contain rounded-lg" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearPreview(); }}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white text-sm transition-colors"
              aria-label="移除照片"
            >
              ✕
            </button>
          </div>
        ) : (
          <p className="text-gray-400">點此選擇照片</p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Uploader */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">上傳者</label>
        <select
          value={uploader}
          onChange={(e) => setUploader(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
        >
          <option value="柔柔">柔柔</option>
          <option value="伴伴">伴伴</option>
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="幫這張照片取個名字"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="寫點什麼吧…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
      >
        {uploading ? "上傳中…" : "上傳照片"}
      </button>
    </form>
  );
}
