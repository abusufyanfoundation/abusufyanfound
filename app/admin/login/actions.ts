"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "@/lib/auth/types";
import { logAudit } from "@/lib/admin/audit";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please enter your email address and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  // One generic message so the form never reveals which emails exist
  if (error || !data.user) {
    return { error: "Incorrect email address or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, is_active")
    .eq("id", data.user.id)
    .maybeSingle<{
      role: string;
      full_name: string | null;
      is_active: boolean;
    }>();

  if (profile?.role !== "admin" || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "This account does not have administrator access." };
  }

  await logAudit(
    supabase,
    { user: data.user, profile },
    {
      action: "auth.sign_in",
      entity: "session",
      summary: "Signed in",
    },
  );

  redirect("/admin");
}
