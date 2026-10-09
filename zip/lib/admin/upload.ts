import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 4 * 1024 * 1024;

export type UploadResult = { url?: string; error?: string };

// Returns an empty object when no file was chosen
export async function uploadImage(
  supabase: SupabaseClient,
  bucket: "book-covers" | "campaign-images",
  file: FormDataEntryValue | null,
): Promise<UploadResult> {
  if (!(file instanceof File) || file.size === 0) return {};

  const ext = TYPES[file.type];
  if (!ext) return { error: "Please upload a JPG, PNG or WebP image." };
  if (file.size > MAX_BYTES)
    return { error: "The image must be 4 MB or smaller." };

  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

  if (error) {
    console.error("uploadImage:", error.message);
    return { error: "The image could not be uploaded. Please try again." };
  }

  return {
    url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
  };
}
