"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit } from "@/lib/admin/audit";
import { diffFields } from "@/lib/admin/diff";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { FormState } from "@/lib/forms/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const GENERIC = "Your changes could not be saved. Please try again.";

const nameSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "That name is too long"),
});

const passwordSchema = z
  .object({
    current: z.string().min(1, "Please enter your current password."),
    password: z
      .string()
      .min(10, "Your new password must be at least 10 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "The two new passwords do not match.",
    path: ["confirm"],
  })
  .refine((v) => v.password !== v.current, {
    message: "Your new password must be different from the current one.",
    path: ["password"],
  });

export async function saveProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireAdmin();

  const parsed = nameSchema.safeParse({ fullName: formData.get("fullName") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { fullName } = parsed.data;

  // profiles has no update policy on purpose. The id comes from the session, never the form.
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", actor.user.id);

  if (error) {
    console.error("saveProfile:", error.message);
    return { error: GENERIC };
  }

  const changes = diffFields(
    { Name: actor.profile.full_name ?? "" },
    { Name: fullName },
  );

  if (changes.length > 0) {
    const supabase = await createClient();
    await logAudit(supabase, actor, {
      action: "profile.updated",
      entity: "profile",
      entityId: actor.user.id,
      summary: "Updated their profile",
      details: { changes },
    });
  }

  revalidatePath("/admin", "layout");
  return { message: "Profile saved." };
}

export async function changePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireAdmin();

  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const email = actor.user.email;
  if (!email) return { error: GENERIC };

  const supabase = await createClient();

  // Anyone left signed in on a shared computer cannot change the password without knowing it
  const { error: checkError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.current,
  });
  if (checkError) return { error: "Your current password is not correct." };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: "We could not update your password. Please try again." };
  }

  await logAudit(supabase, actor, {
    action: "profile.password_changed",
    entity: "profile",
    entityId: actor.user.id,
    summary: "Changed their password",
  });

  return { message: "Your password has been updated." };
}
