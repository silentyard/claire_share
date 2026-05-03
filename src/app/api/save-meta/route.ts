import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// Called by the client after a successful direct-to-Blob upload.
// Saves the companion .meta.json file.
export async function POST(request: Request) {
  const { imageUrl, title, description, uploader } = await request.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
  }

  // Derive the base name from the blob URL path
  const urlPath = new URL(imageUrl).pathname; // e.g. /photos/1234567890.jpg
  const baseName = urlPath.replace(/^\//, ""); // photos/1234567890.jpg

  const metadata = {
    title: title || "Untitled",
    description: description || "",
    uploader: uploader || "",
    imageUrl,
    uploadedAt: new Date().toISOString(),
  };

  await put(`${baseName}.meta.json`, JSON.stringify(metadata), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
