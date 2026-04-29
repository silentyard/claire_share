import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const title = (formData.get("title") as string) || "Untitled";
  const description = (formData.get("description") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const timestamp = Date.now();
  const ext = file.name.split(".").pop();
  const baseName = `photos/${timestamp}.${ext}`;

  // Upload image
  const imageBlob = await put(baseName, file, { access: "public" });

  // Upload metadata as companion JSON
  const metadata = { title, description, imageUrl: imageBlob.url, uploadedAt: new Date().toISOString() };
  await put(`${baseName}.meta.json`, JSON.stringify(metadata), {
    access: "public",
    contentType: "application/json",
  });

  return NextResponse.json({ url: imageBlob.url });
}
