const HTTP_URL_PATTERN = /^https?:\/\//;

export function getCommentStorageId(postId?: string | null, imageUrl?: string | null): string {
  return postId || imageUrl || "";
}

export function getCommentBlobPath(storageId: string): string {
  const filename = HTTP_URL_PATTERN.test(storageId)
    ? Buffer.from(storageId).toString("base64url")
    : storageId;
  return `comments/${filename}.json`;
}

export function decodeCommentStorageId(pathname: string): string {
  const filename = pathname.replace(/^comments\//, "").replace(/\.json$/, "");

  try {
    const decoded = Buffer.from(filename, "base64url").toString("utf-8");
    if (HTTP_URL_PATTERN.test(decoded)) return decoded;
  } catch {
    // Not a legacy base64url imageUrl key.
  }

  return filename;
}
