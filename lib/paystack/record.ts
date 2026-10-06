import "server-only";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction, type PaystackTransaction } from "./verify";

export type RecordResult =
  | "success"
  | "needs_refund"
  | "already_processed"
  | "pending"
  | "failed"
  | "mismatch"
  | "not_found"
  | "error";

// Keep only what we need. Never store card or customer details.
const pickRaw = (tx: PaystackTransaction) => ({
  id: tx.id,
  status: tx.status,
  reference: tx.reference,
  amount: tx.amount,
  currency: tx.currency,
  channel: tx.channel,
  paid_at: tx.paid_at ?? null,
  gateway_response: tx.gateway_response ?? null,
  fees: tx.fees ?? null,
  subaccount: tx.subaccount?.subaccount_code ?? null,
});

// The only place a payment is marked as paid.
// Never trusts the browser or the webhook body: it asks Paystack directly.
export async function verifyAndRecord(
  reference: string,
): Promise<RecordResult> {
  const admin = createAdminClient();

  let tx: PaystackTransaction;
  try {
    tx = await verifyTransaction(reference);
  } catch (e) {
    console.error("verifyAndRecord: verify failed", e);
    return "error";
  }

  if (tx.status === "failed") {
    await admin.rpc("mark_payment_failed", { p_reference: reference });
    revalidatePath("/books");
    return "failed";
  }

  // abandoned / ongoing / pending: the expiry job releases stock if it never completes
  if (tx.status !== "success") return "pending";

  // Safety checks before money is recorded
  const expectedSub = process.env.PAYSTACK_SUBACCOUNT_CODE;
  const actualSub = tx.subaccount?.subaccount_code;

  if (
    tx.currency !== "NGN" ||
    (expectedSub && actualSub && actualSub !== expectedSub)
  ) {
    console.error("verifyAndRecord: unexpected currency or subaccount", {
      reference,
      currency: tx.currency,
      actualSub,
    });
    return "mismatch";
  }
  if (expectedSub && !actualSub) {
    console.warn(
      "verifyAndRecord: verify response had no subaccount",
      reference,
    );
  }

  const { data, error } = await admin.rpc("mark_payment_success", {
    p_reference: reference,
    p_paystack_id: String(tx.id),
    p_amount_kobo: tx.amount,
    p_channel: tx.channel ?? null,
    p_raw: pickRaw(tx),
  });

  if (error) {
    console.error(
      "verifyAndRecord: mark_payment_success failed",
      error.message,
    );
    return "error";
  }

  // Refresh pages that show totals or stock
  revalidatePath("/");
  revalidatePath("/books");

  switch (data as string) {
    case "SUCCESS":
      return "success";
    case "SUCCESS_NEEDS_REFUND":
      return "needs_refund";
    case "ALREADY_PROCESSED":
      return "already_processed";
    case "NOT_FOUND":
      return "not_found";
    case "AMOUNT_MISMATCH":
      return "mismatch";
    default:
      return "error";
  }
}
