"use server";

import { redirect } from "next/navigation";
import type { CheckoutState } from "@/lib/checkout/types";
import { getCurrentCampaign } from "@/lib/data/public";
import { toKobo } from "@/lib/money";
import { initializeTransaction } from "@/lib/paystack/initialize";
import { newReference } from "@/lib/paystack/reference";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  bookOrderSchema,
  generalDonationSchema,
} from "@/lib/validation/checkout";

const GENERIC =
  "Something went wrong while starting your payment. Please try again.";

const callbackUrl = () =>
  `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/paystack/callback`;

function donorFields(formData: FormData) {
  return {
    donorName: String(formData.get("donorName") ?? ""),
    donorEmail: String(formData.get("donorEmail") ?? ""),
    donorPhone: String(formData.get("donorPhone") ?? "").trim() || undefined,
    displayPublicly: formData.get("displayPublicly") === "on",
  };
}

/* ───────── Campaign / general donation ───────── */

export async function startGeneralDonation(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const parsed = generalDonationSchema.safeParse({
    ...donorFields(formData),
    amountNaira: Number(formData.get("amount")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  // The campaign is always looked up on the server, never taken from the form
  const campaign = await getCurrentCampaign();

  const reference = newReference();
  const amountKobo = toKobo(input.amountNaira);
  const admin = createAdminClient();

  const { error } = await admin.rpc("create_general_donation", {
    p_reference: reference,
    p_campaign_id: campaign?.id ?? null,
    p_donor_name: input.donorName,
    p_donor_email: input.donorEmail,
    p_display_publicly: input.displayPublicly,
    p_amount_kobo: amountKobo,
  });
  if (error) {
    console.error("create_general_donation:", error.message);
    return { error: GENERIC };
  }

  let authorizationUrl: string;
  try {
    const tx = await initializeTransaction({
      email: input.donorEmail,
      amountKobo,
      reference,
      callbackUrl: callbackUrl(),
      metadata: { kind: "general", campaign: campaign?.slug ?? null },
    });
    authorizationUrl = tx.authorization_url;
  } catch (e) {
    console.error("initializeTransaction (general):", e);
    await admin.rpc("mark_payment_failed", { p_reference: reference });
    return { error: GENERIC };
  }

  redirect(authorizationUrl);
}

/* ───────── Book pre-fund ───────── */

export async function startBookOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return {
      error:
        "Your selection could not be read. Please go back and choose your books again.",
    };
  }

  const parsed = bookOrderSchema.safeParse({ ...donorFields(formData), items });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const reference = newReference();
  const admin = createAdminClient();

  // Prices come from the database. Only book IDs and quantities are sent.
  const { data, error } = await admin.rpc("create_book_order", {
    p_reference: reference,
    p_donor_name: input.donorName,
    p_donor_email: input.donorEmail,
    p_donor_phone: input.donorPhone ?? null,
    p_display_publicly: input.displayPublicly,
    p_items: input.items.map((i) => ({
      book_id: i.bookId,
      quantity: i.quantity,
    })),
  });

  if (error) {
    // A book in the selection has since been hidden or removed from the list
    const match = /BOOK_UNAVAILABLE:([0-9a-f-]{36})/.exec(error.message);
    if (match) {
      const { data: book } = await admin
        .from("books")
        .select("title")
        .eq("id", match[1])
        .maybeSingle<{ title: string }>();

      return {
        error: book
          ? `“${book.title}” is no longer on our list. Please remove it from your selection.`
          : "One of the books in your selection is no longer on our list. Please choose your books again.",
      };
    }
    console.error("create_book_order:", error.message);
    return { error: GENERIC };
  }

  const row = (data as { order_id: string; total_kobo: number }[] | null)?.[0];
  if (!row) return { error: GENERIC };

  let authorizationUrl: string;
  try {
    const tx = await initializeTransaction({
      email: input.donorEmail,
      amountKobo: row.total_kobo,
      reference,
      callbackUrl: callbackUrl(),
      metadata: { kind: "books", order_id: row.order_id },
    });
    authorizationUrl = tx.authorization_url;
  } catch (e) {
    console.error("initializeTransaction (books):", e);
    await admin.rpc("mark_payment_failed", { p_reference: reference });
    return { error: GENERIC };
  }

  redirect(authorizationUrl);
}
