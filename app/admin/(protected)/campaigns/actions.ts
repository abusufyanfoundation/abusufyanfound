"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { diffFields } from "@/lib/admin/diff";
import { logAudit } from "@/lib/admin/audit";
import { uploadImage } from "@/lib/admin/upload";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { FormState } from "@/lib/forms/types";
import { formatNaira, toKobo } from "@/lib/money";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { campaignRaisedSchema, campaignSchema } from "@/lib/validation/admin";

const GENERIC = "The campaign could not be saved. Please try again.";
const ACTIVE_CONFLICT =
  "Another campaign is already active. Deactivate it first, then activate this one.";

const isActiveConflict = (message: string) =>
  message.includes("one_active_campaign");

function refresh() {
  revalidatePath("/");
  revalidatePath("/support");
  revalidatePath("/admin");
  revalidatePath("/admin/campaigns");
  revalidatePath("/admin/activity");
}

type Existing = {
  title: string;
  description: string | null;
  target_kobo: number;
  is_active: boolean;
  image_url: string | null;
};

export async function saveCampaign(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  // A batch-based campaign has no target of its own: each batch has one
  const { data: current } = id
    ? await supabase
        .from("campaigns")
        .select("campaign_type")
        .eq("id", id)
        .maybeSingle<{ campaign_type: string }>()
    : { data: null };
  const isBatch = current
    ? current.campaign_type === "batch"
    : formData.get("campaignType") === "batch";

  const parsed = campaignSchema.safeParse({
    title: formData.get("title"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    targetNaira: isBatch ? 1 : Number(formData.get("targetNaira")),
    isActive: formData.get("isActive") === "on",
    campaignType: formData.get("campaignType") ?? "normal",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const upload = await uploadImage(
    supabase,
    "campaign-images",
    formData.get("image"),
  );
  if (upload.error) return { error: upload.error };

  const row = {
    title: input.title,
    description: input.description ?? null,
    target_kobo: isBatch ? 0 : toKobo(input.targetNaira),
    is_active: input.isActive,
    ...(upload.url ? { image_url: upload.url } : {}),
  };

  if (id) {
    const { data: before } = await supabase
      .from("campaigns")
      .select("title, description, target_kobo, is_active, image_url")
      .eq("id", id)
      .maybeSingle<Existing>();

    const { error } = await supabase.from("campaigns").update(row).eq("id", id);
    if (error) {
      return {
        error: isActiveConflict(error.message) ? ACTIVE_CONFLICT : GENERIC,
      };
    }

    if (before) {
      const changes = diffFields(
        {
          Title: before.title,
          Description: before.description ?? "",
          Target: formatNaira(before.target_kobo),
          Active: before.is_active ? "Yes" : "No",
          Image: before.image_url ? "Set" : "None",
        },
        {
          Title: row.title,
          Description: row.description ?? "",
          Target: formatNaira(row.target_kobo),
          Active: row.is_active ? "Yes" : "No",
          Image: upload.url ? "Replaced" : before.image_url ? "Set" : "None",
        },
      ).filter(
        (c) => !(c.field === "Image" && c.from === "Set" && c.to === "Set"),
      );

      if (changes.length > 0) {
        await logAudit(supabase, actor, {
          action: "campaign.updated",
          entity: "campaign",
          entityId: id,
          summary: `Updated campaign “${input.title}”`,
          details: { changes },
        });
      }
    }

    refresh();
    revalidatePath(`/admin/campaigns/${id}`);
    return { message: "Campaign saved." };
  }

  let slug = slugify(input.title);
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("campaigns")
      .insert({ ...row, campaign_type: input.campaignType, slug })
      .select("id")
      .single();

    if (!error && data) {
      await logAudit(supabase, actor, {
        action: "campaign.created",
        entity: "campaign",
        entityId: data.id,
        summary: `Created campaign “${input.title}”`,
        details: {
          target: formatNaira(row.target_kobo),
          active: row.is_active,
          type: input.campaignType === "batch" ? "Batch-based" : "General",
        },
      });
      refresh();
      redirect(`/admin/campaigns/${data.id}`);
    }

    if (error && isActiveConflict(error.message)) {
      return { error: ACTIVE_CONFLICT };
    }

    // Slug already taken: add a short suffix and try again
    if (error?.message.includes("slug")) {
      slug = `${slugify(input.title)}-${crypto.randomUUID().slice(0, 4)}`;
      continue;
    }
    return { error: GENERIC };
  }
  return { error: GENERIC };
}

export async function setCampaignActive(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("campaigns")
    .select("title")
    .eq("id", id)
    .maybeSingle<{ title: string }>();

  let query = supabase
    .from("campaigns")
    .update({ is_active: active })
    .eq("id", id);
  if (active) query = query.is("completed_at", null);
  const { error } = await query;

  if (!error) {
    await logAudit(supabase, actor, {
      action: active ? "campaign.activated" : "campaign.deactivated",
      entity: "campaign",
      entityId: id,
      summary: `${active ? "Activated" : "Deactivated"} campaign “${current?.title ?? "Unknown"}”`,
    });
  }

  refresh();
  revalidatePath(`/admin/campaigns/${id}`);

  if (error) {
    const message = isActiveConflict(error.message)
      ? ACTIVE_CONFLICT
      : "The campaign could not be updated.";
    redirect(`/admin/campaigns/${id}?error=${encodeURIComponent(message)}`);
  }
  redirect(`/admin/campaigns/${id}`);
}

export async function completeCampaign(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("campaigns")
    .select("title")
    .eq("id", id)
    .maybeSingle<{ title: string }>();

  const { error } = await supabase
    .from("campaigns")
    .update({ completed_at: new Date().toISOString(), is_active: false })
    .eq("id", id)
    .is("completed_at", null);

  if (!error) {
    await logAudit(supabase, actor, {
      action: "campaign.completed",
      entity: "campaign",
      entityId: id,
      summary: `Marked campaign “${current?.title ?? "Unknown"}” as completed`,
    });
  }

  refresh();
  revalidatePath(`/admin/campaigns/${id}`);

  if (error) {
    redirect(
      `/admin/campaigns/${id}?error=${encodeURIComponent("The campaign could not be updated.")}`,
    );
  }
  redirect(`/admin/campaigns/${id}`);
}

export async function saveCampaignRaised(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = campaignRaisedSchema.safeParse({
    raisedNaira: Number(formData.get("raisedNaira")),
  });
  if (!/^[0-9a-f-]{36}$/i.test(id) || !parsed.success) {
    const message = parsed.success
      ? "The campaign could not be found."
      : parsed.error.issues[0].message;
    redirect(`/admin/campaigns/${id}?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();

  const [{ data: campaign }, { data: before }] = await Promise.all([
    supabase
      .from("campaigns")
      .select("title")
      .eq("id", id)
      .maybeSingle<{ title: string }>(),
    supabase
      .from("campaign_funds")
      .select("raised_kobo")
      .eq("campaign_id", id)
      .maybeSingle<{ raised_kobo: number }>(),
  ]);

  const raisedKobo = toKobo(parsed.data.raisedNaira);

  const { error } = await supabase.from("campaign_funds").upsert({
    campaign_id: id,
    raised_kobo: raisedKobo,
    updated_at: new Date().toISOString(),
    updated_by: actor.user.id,
  });

  if (error) {
    console.error("saveCampaignRaised:", error.message);
    redirect(
      `/admin/campaigns/${id}?error=${encodeURIComponent("The amount could not be saved.")}`,
    );
  }

  await logAudit(supabase, actor, {
    action: "campaign.raised_updated",
    entity: "campaign",
    entityId: id,
    summary: `Set amount raised on “${campaign?.title ?? "Unknown"}” to ${formatNaira(raisedKobo)}`,
    details: {
      from: formatNaira(before?.raised_kobo ?? 0),
      to: formatNaira(raisedKobo),
    },
  });

  refresh();
  revalidatePath(`/admin/campaigns/${id}`);
  redirect(
    `/admin/campaigns/${id}?notice=${encodeURIComponent("Amount raised saved.")}`,
  );
}
