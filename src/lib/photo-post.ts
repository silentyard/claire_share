export interface PhotoMeta {
  title: string;
  description: string;
  /** Primary image URL. Kept for backwards compatibility with single-image posts. */
  imageUrl: string;
  /** All image URLs in this post. New multi-photo posts should always set this. */
  imageUrls?: string[];
  /** Stable post identifier. Legacy posts may not have this and fall back to imageUrl. */
  postId?: string;
  uploadedAt: string;
  uploader?: string;
}

export function getPostKey(photo: PhotoMeta): string {
  return photo.postId || photo.imageUrl;
}

export function getPhotoImageUrls(photo: PhotoMeta): string[] {
  const urls = photo.imageUrls?.filter(Boolean);
  if (urls?.length) return urls;
  return photo.imageUrl ? [photo.imageUrl] : [];
}

export function hasMultipleImages(photo: PhotoMeta): boolean {
  return getPhotoImageUrls(photo).length > 1;
}

export function createPostId(): string {
  return Date.now().toString();
}

export function getPhotoBlobPath(postId: string, index: number, filename: string): string {
  const ext = filename.split(".").pop() || "jpg";
  const suffix = index === 0 ? "" : `-${index}`;
  return `photos/${postId}${suffix}.${ext}`;
}
