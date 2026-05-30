import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createPostId, getPhotoBlobPath } from "@/lib/photo-post";
import type { PhotoMeta } from "@/lib/photo-post";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData
    .getAll("file")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const title = (formData.get("title") as string) || "Untitled";
  const description = (formData.get("description") as string) || "";
  const uploader = (formData.get("uploader") as string) || "";

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const postId = createPostId();
  const uploadedAt = new Date().toISOString();

  const imageUrls = await Promise.all(
    files.map(async (file, index) => {
      const blobPath = getPhotoBlobPath(postId, index, file.name);
      const imageBlob = await put(blobPath, file, { access: "public" });
      return imageBlob.url;
    })
  );

  const primaryBlobPath = getPhotoBlobPath(postId, 0, files[0].name);
  const metadata: PhotoMeta = {
    title,
    description,
    uploader,
    postId,
    imageUrl: imageUrls[0],
    imageUrls,
    uploadedAt,
  };

  await put(`${primaryBlobPath}.meta.json`, JSON.stringify(metadata), {
    access: "public",
    contentType: "application/json",
  });

  revalidatePath("/");
  return NextResponse.json({ url: imageUrls[0], urls: imageUrls, postId });
}
