import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 4 * 1024 * 1024;

// The first bytes of a genuine image file
const SIGNATURES: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) =>
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) =>
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50,
};

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

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!SIGNATURES[file.type](head)) {
    return { error: "That file is not a real image. Please choose another." };
  }

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
