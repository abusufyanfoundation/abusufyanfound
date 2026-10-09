"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/admin/audit";
import { diffFields } from "@/lib/admin/diff";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { FormState } from "@/lib/forms/types";
import { createClient } from "@/lib/supabase/server";
import { batchBookSchema, batchSchema } from "@/lib/validation/admin";

const GENERIC = "The batch could not be saved. Please try again.";

// Messages raised by our own database rules are written for people to read
const dbMessage = (
  error: { code?: string; message: string },
  fallback = GENERIC,
) => (error.code === "P0001" ? error.message : fallback);

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim() || undefined;

function refresh(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/batches");
  revalidatePath("/admin/activity");
  revalidatePath("/apply");
  if (id) revalidatePath(`/admin/batches/${id}`);
}

export async function saveBatch(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireAdmin();

  const parsed = batchSchema.safeParse({
    title: formData.get("title"),
    description: text(formData, "description"),
    campaignId: text(formData, "campaignId"),
    maxCopies: Number(formData.get("maxCopies")),
    opensOn: text(formData, "opensOn"),
    closesOn: text(formData, "closesOn"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  if (input.opensOn && input.closesOn && input.closesOn < input.opensOn) {
    return { error: "The closing date must be on or after the opening date." };
  }

  const row = {
    title: input.title,
    description: input.description ?? null,
    max_copies_per_applicant: input.maxCopies,
    opens_at: input.opensOn ? `${input.opensOn}T00:00:00+01:00` : null,
    closes_at: input.closesOn ? `${input.closesOn}T23:59:59+01:00` : null,
  };

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  if (id) {
    const { data: before } = await supabase
      .from("batches")
      .select(
        "title, description, max_copies_per_applicant, opens_at, closes_at",
      )
      .eq("id", id)
      .maybeSingle<{
        title: string;
        description: string | null;
        max_copies_per_applicant: number;
        opens_at: string | null;
        closes_at: string | null;
      }>();

    const { error } = await supabase.from("batches").update(row).eq("id", id);
    if (error) return { error: dbMessage(error) };

    if (before) {
      const changes = diffFields(
        {
          Title: before.title,
          Description: before.description ?? "",
          "Copies per applicant": String(before.max_copies_per_applicant),
          Opens: before.opens_at ?? "",
          Closes: before.closes_at ?? "",
        },
        {
          Title: row.title,
          Description: row.description ?? "",
          "Copies per applicant": String(row.max_copies_per_applicant),
          Opens: row.opens_at ?? "",
          Closes: row.closes_at ?? "",
        },
      );

      if (changes.length > 0) {
        await logAudit(supabase, actor, {
          action: "batch.updated",
          entity: "batch",
          entityId: id,
          summary: `Updated batch “${input.title}”`,
          details: { changes },
        });
      }
    }

    refresh(id);
    return { message: "Batch saved." };
  }

  if (!input.campaignId) return { error: "Please choose a campaign" };

  const { data, error } = await supabase
    .from("batches")
    .insert({ ...row, campaign_id: input.campaignId, status: "draft" })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) return { error: error ? dbMessage(error) : GENERIC };

  await logAudit(supabase, actor, {
    action: "batch.created",
    entity: "batch",
    entityId: data.id,
    summary: `Created batch “${input.title}”`,
  });

  refresh();
  redirect(`/admin/batches/${data.id}`);
}

const NEXT: Record<string, string[]> = {
  draft: ["open"],
  open: ["closed", "fulfilled"],
  closed: ["open", "fulfilled"],
  fulfilled: [],
};

export async function setBatchStatus(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  const back = (key: "error" | "notice", message: string): never =>
    redirect(`/admin/batches/${id}?${key}=${encodeURIComponent(message)}`);

  const supabase = await createClient();

  const { data: batch } = await supabase
    .from("batches")
    .select("title, status")
    .eq("id", id)
    .maybeSingle<{ title: string; status: string }>();

  if (!batch || !(NEXT[batch.status] ?? []).includes(status)) {
    return back("error", "That change is not allowed for this batch.");
  }

  if (status === "open") {
    const { count } = await supabase
      .from("batch_books")
      .select("id", { count: "exact", head: true })
      .eq("batch_id", id);

    if (!count)
      return back("error", "Add at least one book before opening this batch.");
  }

  const { error } = await supabase
    .from("batches")
    .update({ status })
    .eq("id", id);
  if (error)
    return back("error", dbMessage(error, "The batch could not be updated."));

  await logAudit(supabase, actor, {
    action: `batch.${status}`,
    entity: "batch",
    entityId: id,
    summary: `Changed batch “${batch.title}” to ${status}`,
    details: { from: batch.status, to: status },
  });

  refresh(id);
  return back("notice", `Batch is now ${status}.`);
}

export async function addBatchBook(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireAdmin();

  const batchId = String(formData.get("batchId") ?? "");

  const parsed = batchBookSchema.safeParse({
    title: formData.get("bookTitle"),
    author: text(formData, "bookAuthor"),
    copies: Number(formData.get("copies")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase.from("batch_books").insert({
    batch_id: batchId,
    title: input.title,
    author: input.author ?? null,
    quantity_available: input.copies,
  });
  if (error) return { error: "The book could not be added. Please try again." };

  await logAudit(supabase, actor, {
    action: "batch.book_added",
    entity: "batch",
    entityId: batchId,
    summary: `Added “${input.title}” (${input.copies} copies) to a batch`,
  });

  refresh(batchId);
  return { message: "Book added." };
}

export async function updateBatchBook(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const batchId = String(formData.get("batchId") ?? "");
  const copies = Number(formData.get("copies"));

  const back = (key: "error" | "notice", message: string): never =>
    redirect(`/admin/batches/${batchId}?${key}=${encodeURIComponent(message)}`);

  if (!Number.isInteger(copies) || copies < 0 || copies > 100000) {
    return back("error", "Enter a whole number of copies.");
  }

  const supabase = await createClient();

  const { data: book } = await supabase
    .from("batch_books")
    .select("title, quantity_available")
    .eq("id", id)
    .eq("batch_id", batchId)
    .maybeSingle<{ title: string; quantity_available: number }>();

  if (!book) return back("error", "That book could not be found.");

  const { data: items } = await supabase
    .from("application_items")
    .select("quantity_approved, applications!inner(status)")
    .eq("batch_book_id", id)
    .neq("applications.status", "rejected")
    .returns<{ quantity_approved: number }[]>();

  const allocated = (items ?? []).reduce(
    (sum, i) => sum + i.quantity_approved,
    0,
  );

  if (copies < allocated) {
    return back(
      "error",
      `${allocated} copies are already allocated to applications. Lower those first.`,
    );
  }

  const { error } = await supabase
    .from("batch_books")
    .update({ quantity_available: copies })
    .eq("id", id);

  if (error) return back("error", "The copies could not be updated.");

  await logAudit(supabase, actor, {
    action: "batch.book_updated",
    entity: "batch",
    entityId: batchId,
    summary: `Changed “${book.title}” to ${copies} copies`,
    details: { from: book.quantity_available, to: copies },
  });

  refresh(batchId);
  return back("notice", "Copies updated.");
}

export async function deleteBatchBook(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const batchId = String(formData.get("batchId") ?? "");

  const back = (key: "error" | "notice", message: string): never =>
    redirect(`/admin/batches/${batchId}?${key}=${encodeURIComponent(message)}`);

  const supabase = await createClient();

  const { data: book } = await supabase
    .from("batch_books")
    .select("title")
    .eq("id", id)
    .eq("batch_id", batchId)
    .maybeSingle<{ title: string }>();

  if (!book) return back("error", "That book could not be found.");

  const { error } = await supabase.from("batch_books").delete().eq("id", id);

  if (error) {
    return back(
      "error",
      error.code === "23503"
        ? "This book already has applications or distributions and cannot be removed."
        : "The book could not be removed.",
    );
  }

  await logAudit(supabase, actor, {
    action: "batch.book_removed",
    entity: "batch",
    entityId: batchId,
    summary: `Removed “${book.title}” from a batch`,
  });

  refresh(batchId);
  return back("notice", "Book removed.");
}
