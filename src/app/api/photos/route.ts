import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export interface PhotoMeta {
  title: string;
  description: string;
  imageUrl: string;
  uploadedAt: string;
  uploader?: string;
}

export async function GET() {
  const { blobs } = await list({ prefix: "photos/", limit: 200 });

  // Only process metadata files
  const metaBlobs = blobs.filter((b) => b.pathname.endsWith(".meta.json"));

  const photos: PhotoMeta[] = await Promise.all(
    metaBlobs.map(async (blob) => {
      const res = await fetch(blob.url);
      return res.json() as Promise<PhotoMeta>;
    })
  );

  // Sort newest first
  photos.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return NextResponse.json({ photos });
}
