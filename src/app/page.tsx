import HomeClient from "@/components/HomeClient";
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

  return <HomeClient photos={photos} initialComments={initialComments} />;
}
