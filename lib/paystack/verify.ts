import "server-only";

export type PaystackTransaction = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel: string | null;
  paid_at?: string | null;
  gateway_response?: string | null;
  fees?: number | null;
};

export async function verifyTransaction(
  reference: string,
): Promise<PaystackTransaction> {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    },
  );

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status || !json.data) {
    throw new Error(json?.message ?? "Could not verify the payment");
  }
  return json.data as PaystackTransaction;
}
