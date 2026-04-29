import Link from "next/link";
import PhotoGrid from "@/components/PhotoGrid";
import type { PhotoMeta } from "@/app/api/photos/route";
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

export default async function Home() {
  const photos = await getPhotos();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">📷 相簿</h1>
          <Link
            href="/upload"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + 上傳照片
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <PhotoGrid photos={photos} />
      </section>
    </main>
  );
}
