import { NextResponse, type NextRequest } from "next/server";
import { sendDailySummary } from "@/lib/email/daily-summary";

// Vercel Cron calls this once a day and sends the secret in the header
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json(await sendDailySummary());
}
