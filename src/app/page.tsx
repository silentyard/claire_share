import Link from "next/link";
import PhotoGrid from "@/components/PhotoGrid";
import type { PhotoMeta } from "@/app/api/photos/route";

async function getPhotos(): Promise<PhotoMeta[]> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/photos`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.photos ?? [];
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
