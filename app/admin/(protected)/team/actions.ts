"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logAudit } from "@/lib/admin/audit";
import { requireSuperAdmin } from "@/lib/auth/require-admin";
import type { FormState } from "@/lib/forms/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const inviteSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter their full name").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
});

const GENERIC = "The invitation could not be sent. Please try again.";

function refresh() {
  revalidatePath("/admin/team");
  revalidatePath("/admin/activity");
}

export async function inviteAdmin(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireSuperAdmin();

  const parsed = inviteSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { fullName, email } = parsed.data;

  // Inviting creates a sign-in account, so this needs the service-role client
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });

  if (error || !data.user) {
    if (error?.code === "email_exists") {
      return {
        error:
          "That email address already has an account. If it belongs to a deactivated administrator, switch them back on from the list below.",
      };
    }
    console.error("inviteAdmin:", error?.message);
    return { error: GENERIC };
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      role: "admin",
      full_name: fullName,
      is_active: true,
      is_super_admin: false,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("inviteAdmin profile:", profileError.message);
    // Do not leave an account behind that cannot sign in
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: GENERIC };
  }

  const supabase = await createClient();
  await logAudit(supabase, actor, {
    action: "team.invited",
    entity: "team",
    entityId: data.user.id,
    summary: `Invited ${fullName} (${email}) as an administrator`,
  });

  refresh();
  return { message: `Invitation sent to ${email}.` };
}

export async function setAdminActive(formData: FormData) {
  const actor = await requireSuperAdmin();

  const id = String(formData.get("id") ?? "");
  // A switched-on checkbox sends "true"; a switched-off one sends nothing
  const active = formData.get("active") === "true";

  const back = (key: "error" | "notice", message: string): never =>
    redirect(`/admin/team?${key}=${encodeURIComponent(message)}`);

  if (id === actor.user.id) {
    return back("error", "You cannot change your own access.");
  }

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("profiles")
    .select("full_name, role, is_super_admin")
    .eq("id", id)
    .maybeSingle<{
      full_name: string | null;
      role: string;
      is_super_admin: boolean;
    }>();

  if (!member || member.role !== "admin") {
    return back("error", "That administrator could not be found.");
  }
  if (member.is_super_admin) {
    return back("error", "A super admin cannot be deactivated here.");
  }

  const admin = createAdminClient();
  const name = member.full_name ?? "This administrator";

  // Reactivating: lift the sign-in block first, so a failure never locks anyone out
  if (active) {
    const { error } = await admin.auth.admin.updateUserById(id, {
      ban_duration: "none",
    });
    if (error)
      return back("error", "The administrator could not be reactivated.");
  }

  const { error } = await admin
    .from("profiles")
    .update({ is_active: active })
    .eq("id", id);

  if (error) {
    console.error("setAdminActive:", error.message);
    return back("error", "The administrator could not be updated.");
  }

  // Deactivating: the database already blocks them, this also stops new sign-ins
  if (!active) {
    const { error: banError } = await admin.auth.admin.updateUserById(id, {
      ban_duration: "876000h",
    });
    if (banError) console.error("setAdminActive ban:", banError.message);
  }

  await logAudit(supabase, actor, {
    action: active ? "team.activated" : "team.deactivated",
    entity: "team",
    entityId: id,
    summary: `${active ? "Reactivated" : "Deactivated"} administrator ${name}`,
  });

  refresh();
  return back(
    "notice",
    `${name} has been ${active ? "reactivated" : "deactivated"}.`,
  );
}
