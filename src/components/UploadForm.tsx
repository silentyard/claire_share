"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("請選擇一張照片");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* File picker */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <div className="relative mx-auto w-full max-w-sm aspect-video">
            <Image src={preview} alt="preview" fill className="object-contain rounded-lg" />
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
