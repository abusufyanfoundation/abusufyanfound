"use server";

import { redirect } from "next/navigation";
import type { TrackState } from "@/lib/apply/types";
import type { FormState } from "@/lib/forms/types";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  applicationSchema,
  bookRequestSchema,
  normalisePhone,
} from "@/lib/validation/apply";

const GENERIC = "Something went wrong. Please try again in a moment.";

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim() || undefined;

// Our own database rules raise messages written for people, so they are shown as they are
const friendly = (error: { code?: string; message: string }) =>
  error.code === "P0001" ? error.message : GENERIC;

// A real person never sees or fills this hidden field. A bot that does gets a
// normal-looking confirmation and nothing is saved.
function isBot(formData: FormData) {
  return String(formData.get("website") ?? "").trim() !== "";
}

export async function submitApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (isBot(formData)) redirect("/apply/confirmation?reference=APP-00000000");

  const items: { batchBookId: string; quantity: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("qty_")) continue;
    const quantity = Number(value);
    if (Number.isInteger(quantity) && quantity > 0) {
      items.push({ batchBookId: key.slice(4), quantity });
    }
  }

  const parsed = applicationSchema.safeParse({
    batchId: formData.get("batchId"),
    applicantType: formData.get("applicantType"),
    applicantName: formData.get("applicantName"),
    organisationName: text(formData, "organisationName"),
    phone: formData.get("phone"),
    email: text(formData, "email"),
    state: formData.get("state"),
    city: formData.get("city"),
    address: formData.get("address"),
    verifierName: formData.get("verifierName"),
    verifierPhone: formData.get("verifierPhone"),
    fulfilmentMethod: formData.get("fulfilmentMethod"),
    locationId: text(formData, "locationId"),
    items,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const admin = createAdminClient();

  const { data, error } = await admin.rpc("submit_application", {
    p_batch_id: input.batchId,
    p_type: input.applicantType,
    p_name: input.applicantName,
    p_org: input.organisationName ?? null,
    p_email: input.email ?? null,
    p_phone: input.phone,
    p_state: input.state,
    p_city: input.city,
    p_address: input.address,
    p_verifier_name: input.verifierName,
    p_verifier_phone: input.verifierPhone,
    p_method: input.fulfilmentMethod,
    p_location_id:
      input.fulfilmentMethod === "pickup" ? (input.locationId ?? null) : null,
    p_items: input.items.map((i) => ({
      batch_book_id: i.batchBookId,
      quantity: i.quantity,
    })),
  });

  if (error) {
    if (error.code !== "P0001")
      console.error("submit_application:", error.message);
    return { error: friendly(error) };
  }

  redirect(`/apply/confirmation?reference=${encodeURIComponent(String(data))}`);
}

export async function submitBookRequest(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (isBot(formData)) redirect("/apply/confirmation?reference=REQ-00000000");

  const parsed = bookRequestSchema.safeParse({
    applicantType: formData.get("applicantType"),
    requesterName: formData.get("requesterName"),
    organisationName: text(formData, "organisationName"),
    phone: formData.get("phone"),
    email: text(formData, "email"),
    state: formData.get("state"),
    city: formData.get("city"),
    address: formData.get("address"),
    bookTitle: formData.get("bookTitle"),
    bookAuthor: text(formData, "bookAuthor"),
    quantity:
      formData.get("applicantType") === "school"
        ? Number(formData.get("quantity"))
        : 1,
    reason: text(formData, "reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const admin = createAdminClient();

  const { data, error } = await admin.rpc("submit_book_request", {
    p_type: input.applicantType,
    p_name: input.requesterName,
    p_org: input.organisationName ?? null,
    p_email: input.email ?? null,
    p_phone: input.phone,
    p_state: input.state,
    p_city: input.city,
    p_address: input.address,
    p_book_title: input.bookTitle,
    p_book_author: input.bookAuthor ?? null,
    p_quantity: input.quantity,
    p_reason: input.reason ?? null,
  });

  if (error) {
    if (error.code !== "P0001")
      console.error("submit_book_request:", error.message);
    return { error: friendly(error) };
  }

  redirect(`/apply/confirmation?reference=${encodeURIComponent(String(data))}`);
}

export async function trackSubmission(
  _prev: TrackState,
  formData: FormData,
): Promise<TrackState> {
  const reference = String(formData.get("reference") ?? "")
    .trim()
    .toUpperCase();
  const phone = normalisePhone(String(formData.get("phone") ?? ""));

  if (!/^(APP|REQ)-[A-Z0-9]{8}$/.test(reference)) {
    return { error: "Please enter your reference, for example APP-1A2B3C4D." };
  }
  if (!phone)
    return { error: "Please enter the phone number you applied with." };

  const admin = createAdminClient();

  const { data, error } = await admin.rpc("track_submission", {
    p_reference: reference,
    p_phone: phone,
  });

  if (error) {
    console.error("track_submission:", error.message);
    return { error: GENERIC };
  }
  if (!data) {
    return {
      error: "We could not find anything with that reference and phone number.",
    };
  }

  return { result: data as NonNullable<TrackState>["result"] };
}
