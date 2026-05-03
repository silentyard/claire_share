import HomeClient from "@/components/HomeClient";
import type { PhotoMeta } from "@/app/api/photos/route";
import type { Comment } from "@/app/api/comments/route";
import { list } from "@vercel/blob";

// Revalidate the page at most every 30 seconds instead of on every request
export const revalidate = 30;

async function getPhotos(): Promise<PhotoMeta[]> {
  try {
    const { blobs } = await list({ prefix: "photos/", limit: 200 });
    const metaBlobs = blobs.filter((b) => b.pathname.endsWith(".meta.json"));
    const photos: PhotoMeta[] = await Promise.all(
      metaBlobs.map(async (blob) => {
        const res = await fetch(blob.url);
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
  // Single list() call for ALL comments instead of one per photo
  const { blobs: commentBlobs } = await list({ prefix: "comments/", limit: 1000 });

  const result: Record<string, Comment[]> = {};
  for (const photo of photos) {
    result[photo.imageUrl] = [];
  }

  await Promise.all(
    commentBlobs.map(async (blob) => {
      try {
        const res = await fetch(blob.url);
        const comments: Comment[] = await res.json();
        // Decode the filename back to the imageUrl
        const filename = blob.pathname.replace(/^comments\//, "").replace(/\.json$/, "");
        const imageUrl = Buffer.from(filename, "base64url").toString("utf-8");
        if (imageUrl in result) {
          result[imageUrl] = comments;
        }
      } catch {
        // ignore parse errors for individual comment files
      }
    })
  );

  return result;
}

export default async function Home() {
  const photos = await getPhotos();
  const initialComments = await getAllComments(photos);

  return <HomeClient photos={photos} initialComments={initialComments} />;
}
