import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminProfile = {
  role: string;
  full_name: string | null;
  is_active: boolean;
  is_super_admin: boolean;
};

// One lookup per request, however many times a layout, page and action ask
const loadAdmin = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, is_active, is_super_admin")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  return { user, profile };
});

export async function requireAdmin() {
  const found = await loadAdmin();
  if (!found) redirect("/admin/login");

  const { user, profile } = found;
  if (!profile || profile.role !== "admin" || !profile.is_active) {
    redirect("/admin/login?error=unauthorised");
  }

  return { user, profile, isSuperAdmin: profile.is_super_admin };
}

// Pages and actions only a super admin may use. Everyone else sees "not found".
export async function requireSuperAdmin() {
  const actor = await requireAdmin();
  if (!actor.isSuperAdmin) notFound();
  return actor;
}
