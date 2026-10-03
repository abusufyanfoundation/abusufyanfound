"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "@/lib/auth/types";

const schema = z.object({ email: z.string().trim().email() });

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email);

  // Same response whether or not the account exists
  return {
    message:
      "If an account exists for that email address, a password reset link has been sent. Please check your inbox.",
  };
}
