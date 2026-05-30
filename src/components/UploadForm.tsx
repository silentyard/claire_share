"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type SelectedUploadFile = {
  file: File;
  previewUrl: string;
};

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
  const previewUrlsRef = useRef<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<SelectedUploadFile[]>([]);
  const [uploader, setUploader] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (data.displayName) setUploader(data.displayName); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const nextFiles = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.push(previewUrl);
      return { file, previewUrl };
    });

    setSelectedFiles((current) => [...current, ...nextFiles]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeFile(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);
    previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== previewUrl);
    setSelectedFiles((current) => current.filter((item) => item.previewUrl !== previewUrl));
  }

  function clearFiles() {
    selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    previewUrlsRef.current = previewUrlsRef.current.filter(
      (url) => !selectedFiles.some((item) => item.previewUrl === url)
    );
    setSelectedFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError("請選擇至少一張照片");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const compressedFiles = await Promise.all(
        selectedFiles.map((item) => compressImage(item.file))
      );

      const formData = new FormData();
      compressedFiles.forEach((file) => formData.append("file", file));
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
        className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => selectedFiles.length === 0 && fileRef.current?.click()}
      >
        {selectedFiles.length > 0 ? (
          <div className="space-y-3">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {selectedFiles.map((item, index) => (
                <div key={item.previewUrl} className="relative shrink-0 w-28 aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={item.previewUrl} alt={`preview ${index + 1}`} fill className="object-cover" />
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(item.previewUrl); }}
                    className="absolute right-1.5 top-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white text-xs transition-colors"
                    aria-label="移除照片"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                className="flex-1 rounded-full bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-500 hover:bg-pink-100 transition-colors"
              >
                再加照片
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearFiles(); }}
                className="rounded-full bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-400 hover:bg-gray-100 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        ) : (
          <p className="py-6 text-gray-400">點此選擇照片（可多選）</p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Uploader */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">上傳者</label>
        <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-semibold">
          {uploader || "讀取中…"}
        </div>
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
