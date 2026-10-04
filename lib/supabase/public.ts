import { createClient } from "@supabase/supabase-js";

export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Give up after 8 seconds instead of hanging the page
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
      },
    },
  );
}
