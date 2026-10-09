"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

const TYPES = ["student", "mosque", "school"];

export async function createBeneficiary(formData: FormData) {
  const actor = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const location = String(formData.get("location") ?? "").trim();

  if (!name || !TYPES.includes(type)) {
    return;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beneficiaries")
    .insert({
      name,
      type,
      location: location || null,
    })
    .select("id")
    .single<{
      id: string;
    }>();

  if (error || !data) {
    console.error("createBeneficiary:", error?.message);

    return;
  }

  await logAudit(supabase, actor, {
    action: "beneficiary.created",
    entity: "beneficiary",
    entityId: data.id,
    summary: `Added beneficiary "${name}"`,
    details: {
      type,
    },
  });

  revalidatePath("/admin/beneficiaries");
  revalidatePath("/admin/activity");
}
