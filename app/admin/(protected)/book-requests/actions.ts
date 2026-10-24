"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { flash } from "@/lib/admin/flash";
import { requireAdmin } from "@/lib/auth/require-admin";
import { emailBookRequestOutcome, queue } from "@/lib/email/notify";
import { formatNaira, toKobo } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { batchBookSchema, bookSchema } from "@/lib/validation/admin";

type RequestRow = {
  reference: string;
  status: string;
  requester_type: string;
  requester_name: string;
  organisation_name: string | null;
  city: string;
  state: string;
};

function refresh(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/book-requests");
  revalidatePath(`/admin/book-requests/${id}`);
  revalidatePath("/admin/beneficiaries");
  revalidatePath("/admin/activity");
}

export async function reviewBookRequest(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const notes = String(formData.get("notes") ?? "")
    .trim()
    .slice(0, 1000);

  if (!isUuid(id)) {
    return flash("/admin/book-requests", "error", "Book request not found.");
  }

  const back = (key: "error" | "notice", message: string): never =>
    flash(`/admin/book-requests/${id}`, key, message);

  const supabase = await createClient();

  const { data: request } = await supabase
    .from("book_requests")
    .select(
      "reference, status, requester_type, requester_name, organisation_name, city, state",
    )
    .eq("id", id)
    .maybeSingle<RequestRow>();

  if (!request) return back("error", "Book request not found.");

  // Read before the checks below, so TypeScript does not narrow it
  const wasPending = request.status === "pending";
  const open = request.status === "pending" || request.status === "approved";

  const audit = (to: string, label: string) =>
    logAudit(supabase, actor, {
      action: "book_request.status_updated",
      entity: "book_request",
      entityId: id,
      summary: `Changed book request ${request.reference} to ${label}`,
      details: { from: request.status, to },
    });

  // ---- Save notes only ----
  if (intent === "notes") {
    if (!open) {
      return back("error", "Notes on a finished request cannot be changed.");
    }

    const { error } = await supabase
      .from("book_requests")
      .update({ admin_notes: notes || null })
      .eq("id", id);

    if (error) return back("error", "The notes could not be saved.");

    refresh(id);
    return back("notice", "Notes saved.");
  }

  // ---- Approve: added to the list, not bought yet ----
  if (intent === "approve") {
    if (!wasPending) {
      return back("error", "Only pending requests can be approved.");
    }

    const { data: updated, error } = await supabase
      .from("book_requests")
      .update({
        status: "approved",
        admin_notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error || !updated) {
      return back(
        "error",
        "The request could not be approved. It may have changed, so reload and try again.",
      );
    }

    await audit("approved", "Approved");
    queue(() => emailBookRequestOutcome(id, "approved"));

    refresh(id);
    return back(
      "notice",
      "Request approved. It is on your list; the book is not bought yet.",
    );
  }

  // ---- Reject ----
  if (intent === "reject") {
    if (!open) {
      return back(
        "error",
        "Only pending or approved requests can be rejected.",
      );
    }

    const { data: updated, error } = await supabase
      .from("book_requests")
      .update({
        status: "rejected",
        admin_notes: notes || null,
        ...(wasPending ? { reviewed_at: new Date().toISOString() } : {}),
      })
      .eq("id", id)
      .in("status", ["pending", "approved"])
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error || !updated) {
      return back(
        "error",
        "The request could not be rejected. It may have changed, so reload and try again.",
      );
    }

    await audit("rejected", "Rejected");
    queue(() => emailBookRequestOutcome(id, "rejected"));

    refresh(id);
    return back("notice", "Request rejected.");
  }

  // ---- Mark as fulfilled: the requester becomes a beneficiary ----
  if (intent === "fulfil") {
    if (request.status !== "approved") {
      return back(
        "error",
        "Only approved requests can be marked as fulfilled.",
      );
    }

    // Acts as a lock: only one click can move it from approved to fulfilled
    const { data: locked, error: lockError } = await supabase
      .from("book_requests")
      .update({ status: "fulfilled", admin_notes: notes || null })
      .eq("id", id)
      .eq("status", "approved")
      .select("id")
      .maybeSingle<{ id: string }>();

    if (lockError || !locked) {
      return back("error", "This request is no longer approved.");
    }

    const { error: beneficiaryError } = await supabase
      .from("beneficiaries")
      .insert({
        name: request.organisation_name ?? request.requester_name,
        type: request.requester_type,
        location: `${request.city}, ${request.state}`,
        book_request_id: id,
      });

    // 23505 means the beneficiary already exists for this request, which is fine
    if (beneficiaryError && beneficiaryError.code !== "23505") {
      await supabase
        .from("book_requests")
        .update({ status: "approved" })
        .eq("id", id);
      return back(
        "error",
        "The beneficiary record could not be created, so the request is still approved.",
      );
    }

    await audit("fulfilled", "Fulfilled");
    queue(() => emailBookRequestOutcome(id, "fulfilled"));

    refresh(id);
    return back(
      "notice",
      "Marked as fulfilled. The requester has been added to Beneficiaries.",
    );
  }

  return back("error", "Unknown action.");
}

/* ───────── Supplying the requested book ───────── */

type SupplyRow = {
  reference: string;
  status: string;
  book_id: string | null;
  batch_book_id: string | null;
};

async function loadSupplyRequest(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("book_requests")
    .select("reference, status, book_id, batch_book_id")
    .eq("id", id)
    .maybeSingle<SupplyRow>();

  return { supabase, request: data };
}

// Adds the requested book to the pre-fund list, as a draft
export async function addRequestToBooks(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!isUuid(id)) {
    return flash("/admin/book-requests", "error", "Book request not found.");
  }

  const back = (key: "error" | "notice", message: string): never =>
    flash(`/admin/book-requests/${id}`, key, message);

  const parsed = bookSchema
    .pick({ title: true, author: true, priceNaira: true })
    .safeParse({
      title: formData.get("bookTitle"),
      author: formData.get("bookAuthor"),
      priceNaira: Number(formData.get("priceNaira")),
    });

  if (!parsed.success) return back("error", parsed.error.issues[0].message);
  const input = parsed.data;

  const { supabase, request } = await loadSupplyRequest(id);

  if (!request) return back("error", "Book request not found.");
  if (request.status !== "approved") {
    return back("error", "Approve the request first.");
  }
  if (request.book_id || request.batch_book_id) {
    return back("error", "This request has already been added to a list.");
  }

  const { data: book, error } = await supabase
    .from("books")
    .insert({
      title: input.title,
      author: input.author,
      price_kobo: toKobo(input.priceNaira),
      status: "draft",
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !book) {
    console.error("addRequestToBooks:", error?.message);
    return back("error", "The book could not be added. Please try again.");
  }

  // Link it to the request; if the request changed meanwhile, undo the new book
  const { data: linked, error: linkError } = await supabase
    .from("book_requests")
    .update({ book_id: book.id })
    .eq("id", id)
    .is("book_id", null)
    .is("batch_book_id", null)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (linkError || !linked) {
    await supabase.from("books").delete().eq("id", book.id);
    return back(
      "error",
      "The request changed while saving, so nothing was added. Reload and try again.",
    );
  }

  await logAudit(supabase, actor, {
    action: "book.created",
    entity: "book",
    entityId: book.id,
    summary: `Added book “${input.title}” from request ${request.reference}`,
    details: {
      price: formatNaira(toKobo(input.priceNaira)),
      status: "Draft",
    },
  });

  await logAudit(supabase, actor, {
    action: "book_request.book_added",
    entity: "book_request",
    entityId: id,
    summary: `Added request ${request.reference} to the pre-fund list`,
    details: { book_id: book.id },
  });

  revalidatePath("/admin/books");
  refresh(id);
  return back(
    "notice",
    "Added to the pre-fund list as a draft. Open the book to add a cover and list it.",
  );
}

// Adds the requested book to a batch that is still in draft
export async function addRequestToBatch(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!isUuid(id)) {
    return flash("/admin/book-requests", "error", "Book request not found.");
  }

  const back = (key: "error" | "notice", message: string): never =>
    flash(`/admin/book-requests/${id}`, key, message);

  const batchId = String(formData.get("batchId") ?? "");
  if (!isUuid(batchId)) return back("error", "Please choose a batch.");

  const parsed = batchBookSchema.safeParse({
    title: formData.get("bookTitle"),
    author: String(formData.get("bookAuthor") ?? "").trim() || undefined,
    copies: Number(formData.get("copies")),
  });

  if (!parsed.success) return back("error", parsed.error.issues[0].message);
  const input = parsed.data;

  const { supabase, request } = await loadSupplyRequest(id);

  if (!request) return back("error", "Book request not found.");
  if (request.status !== "approved") {
    return back("error", "Approve the request first.");
  }
  if (request.book_id || request.batch_book_id) {
    return back("error", "This request has already been added to a list.");
  }

  const { data: batch } = await supabase
    .from("batches")
    .select("batch_number, title, status")
    .eq("id", batchId)
    .maybeSingle<{ batch_number: number; title: string; status: string }>();

  if (!batch || batch.status !== "draft") {
    return back("error", "Please choose a batch that is still in draft.");
  }

  const { data: batchBook, error } = await supabase
    .from("batch_books")
    .insert({
      batch_id: batchId,
      title: input.title,
      author: input.author ?? null,
      quantity_available: input.copies,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !batchBook) {
    console.error("addRequestToBatch:", error?.message);
    return back("error", "The book could not be added. Please try again.");
  }

  // Link it to the request; if the request changed meanwhile, undo the new book
  const { data: linked, error: linkError } = await supabase
    .from("book_requests")
    .update({ batch_book_id: batchBook.id })
    .eq("id", id)
    .is("book_id", null)
    .is("batch_book_id", null)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (linkError || !linked) {
    await supabase.from("batch_books").delete().eq("id", batchBook.id);
    return back(
      "error",
      "The request changed while saving, so nothing was added. Reload and try again.",
    );
  }

  await logAudit(supabase, actor, {
    action: "batch.book_added",
    entity: "batch",
    entityId: batchId,
    summary: `Added “${input.title}” (${input.copies} copies) to a batch from request ${request.reference}`,
  });

  await logAudit(supabase, actor, {
    action: "book_request.book_added",
    entity: "book_request",
    entityId: id,
    summary: `Added request ${request.reference} to Batch ${batch.batch_number}`,
    details: { batch_id: batchId, batch_book_id: batchBook.id },
  });

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${batchId}`);
  refresh(id);
  return back(
    "notice",
    `Added to Batch ${batch.batch_number}. Open the batch to see it with the other books.`,
  );
}
