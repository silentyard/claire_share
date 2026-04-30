import Link from "next/link";
import PhotoFeed from "@/components/PhotoGrid";
import type { PhotoMeta } from "@/app/api/photos/route";
import type { Comment } from "@/app/api/comments/route";
import { list } from "@vercel/blob";

async function getPhotos(): Promise<PhotoMeta[]> {
  try {
    const { blobs } = await list({ prefix: "photos/", limit: 200 });
    const metaBlobs = blobs.filter((b) => b.pathname.endsWith(".meta.json"));
    const photos: PhotoMeta[] = await Promise.all(
      metaBlobs.map(async (blob) => {
        const res = await fetch(blob.url, { cache: "no-store" });
        return res.json() as Promise<PhotoMeta>;
      })
    );
    photos.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    return photos;
  } catch {
    return [];
  }
}

async function getAllComments(photos: PhotoMeta[]): Promise<Record<string, Comment[]>> {
  const entries = await Promise.all(
    photos.map(async (photo) => {
      try {
        const encoded = Buffer.from(photo.imageUrl).toString("base64url");
        const { blobs } = await list({ prefix: `comments/${encoded}` });
        if (blobs.length === 0) return [photo.imageUrl, []] as const;
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        const comments: Comment[] = await res.json();
        return [photo.imageUrl, comments] as const;
      } catch {
        return [photo.imageUrl, []] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}

export default async function Home() {
  const photos = await getPhotos();
  const initialComments = await getAllComments(photos);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F4A0A0" }}>
      <div className="max-w-sm mx-auto px-4 pt-10 pb-6">
        {/* 標題區 */}
        <h1 className="text-5xl font-black text-center text-gray-900 leading-tight">Claire<br />Share</h1>
        <p className="text-center text-gray-500 mt-1 text-base">分享你的美好時刻</p>

        {/* 上傳按鈕 */}
        <Link
          href="/upload"
          className="mt-6 flex items-center justify-center w-full bg-white/60 hover:bg-white/80 rounded-full py-3 transition-colors shadow-sm"
        >
          <span className="text-2xl font-light text-pink-500">＋</span>
        </Link>

        {/* 照片 feed */}
        <div className="mt-6">
          <PhotoFeed photos={photos} initialComments={initialComments} />
        </div>
      </div>
    </main>
  );
}
