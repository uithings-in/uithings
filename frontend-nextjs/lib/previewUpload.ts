import { uploadApi } from "../api/upload";

const inflightUploads = new WeakMap<File, Promise<string>>();

/**
 * Uploads a preview image and caches the promise by File instance so repeated
 * calls (selection + publish) reuse the same in-flight/completed upload.
 */
export function uploadPreviewFile(file: File): Promise<string> {
  const existing = inflightUploads.get(file);
  if (existing) return existing;

  const promise = uploadApi.uploadImage(file).catch((error) => {
    inflightUploads.delete(file);
    throw error;
  });

  inflightUploads.set(file, promise);
  return promise;
}

/**
 * Starts uploading the selected preview images immediately so publishing does
 * not have to wait for Cloudinary. Errors are ignored here and retried when
 * the publish action calls uploadPreviewFile again.
 */
export function prefetchPreviewUploads(
  files: Array<File | null | undefined>,
): void {
  for (const file of files) {
    if (!file) continue;
    void uploadPreviewFile(file).catch(() => {});
  }
}
