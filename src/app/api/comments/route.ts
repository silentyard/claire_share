import { list, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCommentBlobPath, getCommentStorageId } from "@/lib/server-comment-keys";

export interface Comment {
  author: string;
  text: string;
  createdAt: string;
}

async function loadComments(storageId: string): Promise<Comment[]> {
  const key = getCommentBlobPath(storageId).replace(/\.json$/, "");
  const { blobs } = await list({ prefix: key });
  if (blobs.length === 0) return [];

  const res = await fetch(blobs[0].downloadUrl, { cache: "no-store" });
  return res.json() as Promise<Comment[]>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const imageUrl = searchParams.get("imageUrl");
  const storageId = getCommentStorageId(postId, imageUrl);

  if (!storageId) return NextResponse.json({ comments: [] });

  try {
    let comments = await loadComments(storageId);
    if (comments.length === 0 && postId && imageUrl) {
      comments = await loadComments(imageUrl);
    }
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(request: Request) {
  const { postId, imageUrl, author, text } = await request.json();
  const storageId = getCommentStorageId(postId, imageUrl);

  if (!storageId || !author || !text?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const key = getCommentBlobPath(storageId);

  // Load existing comments
  let comments: Comment[] = [];
  try {
    comments = await loadComments(storageId);
    if (comments.length === 0 && postId && imageUrl) {
      comments = await loadComments(imageUrl);
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

  revalidatePath("/");
  return NextResponse.json({ ok: true, comments });
}
