"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { flash } from "@/lib/admin/flash";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

const TYPES = ["individual", "mosque", "school"];
const PATH = "/admin/beneficiaries";

export async function createBeneficiary(formData: FormData) {
  const actor = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const location = String(formData.get("location") ?? "").trim();

  if (!name || name.length > 200) {
    return flash(PATH, "error", "Please enter a name (up to 200 characters).");
  }
  if (!TYPES.includes(type)) {
    return flash(PATH, "error", "Please choose a type.");
  }
  if (location.length > 200) {
    return flash(PATH, "error", "The location is too long.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beneficiaries")
    .insert({ name, type, location: location || null })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    console.error("createBeneficiary:", error?.message);
    return flash(PATH, "error", "The beneficiary could not be added.");
  }

  await logAudit(supabase, actor, {
    action: "beneficiary.created",
    entity: "beneficiary",
    entityId: data.id,
    summary: `Added beneficiary "${name}"`,
    details: { type },
  });

  revalidatePath(PATH);
  revalidatePath("/admin/activity");
  return flash(PATH, "notice", `${name} was added.`);
}
