import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// Returns false when this connection has made too many requests in the window.
// If the limiter itself fails, real people are let through.
export async function allowRequest(
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";

  const { data, error } = await createAdminClient().rpc("hit_rate_limit", {
    p_key: `${scope}:${ip}`,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("hit_rate_limit:", error.message);
    return true;
  }

  return data === true;
}
