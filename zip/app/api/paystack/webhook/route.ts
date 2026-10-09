import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { verifyAndRecord } from "@/lib/paystack/record";
import { isValidReference } from "@/lib/paystack/reference";

type PaystackEvent = {
  event?: string;
  data?: { reference?: string };
};

function validSignature(raw: string, signature: string) {
  const expected = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(raw)
    .digest("hex");

  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  // The signature is computed over the raw body, so read it as text
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  if (!signature || !validSignature(raw, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  const reference = event.data?.reference;

  if (
    event.event === "charge.success" &&
    typeof reference === "string" &&
    isValidReference(reference)
  ) {
    const result = await verifyAndRecord(reference);
    // Ask Paystack to retry if our own verification hit a temporary error
    if (result === "error") {
      return new NextResponse("Temporary error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
