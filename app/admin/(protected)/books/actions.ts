"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImage } from "@/lib/admin/upload";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { FormState } from "@/lib/forms/types";
import { toKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { bookSchema, newBookSchema, stockSchema } from "@/lib/validation/admin";

const GENERIC = "The book could not be saved. Please try again.";

function refresh() {
  revalidatePath("/books");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
}

export async function saveBook(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { user } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const fields = {
    title: formData.get("title"),
    author: formData.get("author"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    priceNaira: Number(formData.get("priceNaira")),
    status: formData.get("status"),
  };

  const supabase = await createClient();

  if (id) {
    const parsed = bookSchema.safeParse(fields);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const input = parsed.data;

    const upload = await uploadImage(
      supabase,
      "book-covers",
      formData.get("cover"),
    );
    if (upload.error) return { error: upload.error };

    const { error } = await supabase
      .from("books")
      .update({
        title: input.title,
        author: input.author,
        description: input.description ?? null,
        price_kobo: toKobo(input.priceNaira),
        status: input.status,
        ...(upload.url ? { cover_url: upload.url } : {}),
      })
      .eq("id", id);

    if (error) {
      console.error("saveBook (update):", error.message);
      return { error: GENERIC };
    }

    refresh();
    revalidatePath(`/admin/books/${id}`);
    return { message: "Book saved." };
  }

  const parsed = newBookSchema.safeParse({
    ...fields,
    quantity: Number(formData.get("quantity")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const upload = await uploadImage(
    supabase,
    "book-covers",
    formData.get("cover"),
  );
  if (upload.error) return { error: upload.error };

  const { data, error } = await supabase
    .from("books")
    .insert({
      title: input.title,
      author: input.author,
      description: input.description ?? null,
      price_kobo: toKobo(input.priceNaira),
      initial_quantity: input.quantity,
      available_quantity: input.quantity,
      status: input.status,
      ...(upload.url ? { cover_url: upload.url } : {}),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("saveBook (insert):", error?.message);
    return { error: GENERIC };
  }

  if (input.quantity > 0) {
    await supabase.from("book_inventory").insert({
      book_id: data.id,
      delta: input.quantity,
      reason: "initial_stock",
      created_by: user.id,
    });
  }

  refresh();
  redirect(`/admin/books/${data.id}`);
}

export async function adjustStock(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = stockSchema.safeParse({
    bookId: formData.get("bookId"),
    delta: Number(formData.get("delta")),
    note: String(formData.get("note") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_adjust_book_stock", {
    p_book_id: parsed.data.bookId,
    p_delta: parsed.data.delta,
    p_note: parsed.data.note ?? null,
  });

  if (error) {
    return {
      error: error.message.includes("STOCK_CONFLICT")
        ? "Stock cannot go below zero."
        : "The stock could not be updated. Please try again.",
    };
  }

  refresh();
  revalidatePath(`/admin/books/${parsed.data.bookId}`);
  return { message: "Stock updated." };
}
