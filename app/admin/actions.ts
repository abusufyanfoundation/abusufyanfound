"use server";

import { redirect } from "next/navigation";
import { logAudit } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle<{ full_name: string | null }>();

    await logAudit(
      supabase,
      { user, profile },
      {
        action: "auth.sign_out",
        entity: "session",
        summary: "Signed out",
      },
    );
  }

  await supabase.auth.signOut();
  redirect("/admin/login");
}
