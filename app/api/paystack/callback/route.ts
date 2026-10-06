import { NextResponse, type NextRequest } from "next/server";
import { isOurReference } from "@/lib/paystack/reference";
import { verifyAndRecord } from "@/lib/paystack/record";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const reference = params.get("reference") ?? params.get("trxref");

  if (!reference || !isOurReference(reference)) {
    return NextResponse.redirect(new URL("/support", request.url));
  }

  await verifyAndRecord(reference);

  return NextResponse.redirect(
    new URL(
      `/support/confirmation?reference=${encodeURIComponent(reference)}`,
      request.url,
    ),
  );
}
