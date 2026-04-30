import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";

export interface Comment {
  author: string;
  text: string;
  createdAt: string;
}

function commentKey(imageUrl: string) {
  // Use base64 of the imageUrl as filename
  const encoded = Buffer.from(imageUrl).toString("base64url");
  return `comments/${encoded}.json`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("imageUrl");
  if (!imageUrl) return NextResponse.json({ comments: [] });

  try {
    const { blobs } = await list({ prefix: `comments/${Buffer.from(imageUrl).toString("base64url")}` });
    if (blobs.length === 0) return NextResponse.json({ comments: [] });
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    const comments: Comment[] = await res.json();
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(request: Request) {
  const { imageUrl, author, text } = await request.json();
  if (!imageUrl || !author || !text?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const key = commentKey(imageUrl);

  // Load existing comments
  let comments: Comment[] = [];
  try {
    const { blobs } = await list({ prefix: `comments/${Buffer.from(imageUrl).toString("base64url")}` });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      comments = await res.json();
    }
  } catch {
    comments = [];
  }

  comments.push({ author, text: text.trim(), createdAt: new Date().toISOString() });

  await put(key, JSON.stringify(comments), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });

  return NextResponse.json({ ok: true });
}
