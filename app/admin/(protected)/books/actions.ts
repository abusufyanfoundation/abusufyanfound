"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/admin/audit";
import { diffFields } from "@/lib/admin/diff";
import { bookStatusLabel } from "@/lib/admin/labels";
import { uploadImage } from "@/lib/admin/upload";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { FormState } from "@/lib/forms/types";
import { formatNaira, toKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { bookSchema } from "@/lib/validation/admin";

const GENERIC = "The book could not be saved. Please try again.";

function refresh() {
  revalidatePath("/books");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/admin/activity");
}

type Existing = {
  title: string;
  author: string;
  description: string | null;
  price_kobo: number;
  status: string;
  cover_url: string | null;
};

export async function saveBook(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireAdmin();

  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    priceNaira: Number(formData.get("priceNaira")),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  const upload = await uploadImage(
    supabase,
    "book-covers",
    formData.get("cover"),
  );
  if (upload.error) return { error: upload.error };

  const row = {
    title: input.title,
    author: input.author,
    description: input.description ?? null,
    price_kobo: toKobo(input.priceNaira),
    status: input.status,
    ...(upload.url ? { cover_url: upload.url } : {}),
  };

  if (id) {
    const { data: before } = await supabase
      .from("books")
      .select("title, author, description, price_kobo, status, cover_url")
      .eq("id", id)
      .maybeSingle<Existing>();

    const { error } = await supabase.from("books").update(row).eq("id", id);
    if (error) {
      console.error("saveBook (update):", error.message);
      return { error: GENERIC };
    }

    if (before) {
      const changes = diffFields(
        {
          Title: before.title,
          Author: before.author,
          Description: before.description ?? "",
          Price: formatNaira(before.price_kobo),
          Status: bookStatusLabel(before.status),
          Cover: before.cover_url ? "Set" : "None",
        },
        {
          Title: row.title,
          Author: row.author,
          Description: row.description ?? "",
          Price: formatNaira(row.price_kobo),
          Status: bookStatusLabel(row.status),
          Cover: upload.url ? "Replaced" : before.cover_url ? "Set" : "None",
        },
      );

      if (changes.length > 0) {
        await logAudit(supabase, actor, {
          action: "book.updated",
          entity: "book",
          entityId: id,
          summary: `Updated book “${input.title}”`,
          details: { changes },
        });
      }
    }

    refresh();
    revalidatePath(`/admin/books/${id}`);
    return { message: "Book saved." };
  }

  const { data, error } = await supabase
    .from("books")
    .insert(row)
    .select("id")
    .single();

  if (error || !data) {
    console.error("saveBook (insert):", error?.message);
    return { error: GENERIC };
  }

  await logAudit(supabase, actor, {
    action: "book.created",
    entity: "book",
    entityId: data.id,
    summary: `Added book “${input.title}”`,
    details: {
      price: formatNaira(row.price_kobo),
      status: bookStatusLabel(row.status),
    },
  });

  refresh();
  redirect(`/admin/books/${data.id}`);
}
