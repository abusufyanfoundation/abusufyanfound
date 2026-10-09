"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

type App = {
  id: string;
  reference: string;
  status: string;
  applicant_name: string;
  organisation_name: string | null;
  applicant_type: string;
  city: string;
  state: string;
  batch: { campaign_id: string; title: string } | null;
  application_items: {
    id: string;
    quantity_requested: number;
    quantity_approved: number;
    batch_book_id: string;
  }[];
};

const dbMessage = (
  error: { code?: string; message: string },
  fallback: string,
) => (error.code === "P0001" ? error.message : fallback);

function refresh(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  revalidatePath("/admin/batches");
  revalidatePath("/admin/beneficiaries");
  revalidatePath("/admin/activity");
}

export async function reviewApplication(formData: FormData) {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  const back = (key: "error" | "notice", message: string): never =>
    redirect(`/admin/applications/${id}?${key}=${encodeURIComponent(message)}`);

  const supabase = await createClient();

  const { data: app } = await supabase
    .from("applications")
    .select(
      `id, reference, status, applicant_name, organisation_name, applicant_type, city, state,
       batch:batches(campaign_id, title),
       application_items(id, quantity_requested, quantity_approved, batch_book_id)`,
    )
    .eq("id", id)
    .maybeSingle<App>();

  if (!app) return back("error", "Application not found.");

  // ---- Approve (or change approved quantities) ----
  if (intent === "approve") {
    if (app.status !== "pending" && app.status !== "approved") {
      return back(
        "error",
        "Only pending or approved applications can be approved.",
      );
    }

    const wanted = app.application_items.map((item) => ({
      item,
      qty: Number(formData.get(`approved_${item.id}`)),
    }));

    if (
      wanted.some(
        (w) =>
          !Number.isInteger(w.qty) ||
          w.qty < 0 ||
          w.qty > w.item.quantity_requested,
      )
    ) {
      return back(
        "error",
        "Approved copies must be whole numbers, no more than requested.",
      );
    }

    if (wanted.every((w) => w.qty === 0)) {
      return back(
        "error",
        "Approve at least one copy, or reject the application.",
      );
    }

    const done: { id: string; previous: number }[] = [];
    const undo = async () => {
      for (const d of done) {
        await supabase
          .from("application_items")
          .update({ quantity_approved: d.previous })
          .eq("id", d.id);
      }
    };

    for (const w of wanted) {
      if (w.qty === w.item.quantity_approved) continue;

      const { error } = await supabase
        .from("application_items")
        .update({ quantity_approved: w.qty })
        .eq("id", w.item.id);

      if (error) {
        await undo();
        return back(
          "error",
          dbMessage(error, "The copies could not be saved."),
        );
      }
      done.push({ id: w.item.id, previous: w.item.quantity_approved });
    }

    const { error } = await supabase
      .from("applications")
      .update({ status: "approved", admin_notes: notes || null })
      .eq("id", id)
      .in("status", ["pending", "approved"]);

    if (error) {
      await undo();
      return back("error", "The application could not be approved.");
    }

    const total = wanted.reduce((s, w) => s + w.qty, 0);

    await logAudit(supabase, actor, {
      action: "application.approved",
      entity: "application",
      entityId: id,
      summary: `Approved application ${app.reference} (${total} copies)`,
    });

    refresh(id);
    return back("notice", "Application approved.");
  }

  // ---- Reject ----
  if (intent === "reject") {
    if (app.status !== "pending" && app.status !== "approved") {
      return back(
        "error",
        "Only pending or approved applications can be rejected.",
      );
    }

    const { error } = await supabase
      .from("applications")
      .update({ status: "rejected", admin_notes: notes || null })
      .eq("id", id)
      .in("status", ["pending", "approved"]);

    if (error) return back("error", "The application could not be rejected.");

    await logAudit(supabase, actor, {
      action: "application.rejected",
      entity: "application",
      entityId: id,
      summary: `Rejected application ${app.reference}`,
    });

    refresh(id);
    return back("notice", "Application rejected. Its copies are free again.");
  }

  // ---- Mark as fulfilled: creates the beneficiary and the distribution record ----
  if (intent === "fulfil") {
    if (app.status !== "approved") {
      return back(
        "error",
        "Only approved applications can be marked as fulfilled.",
      );
    }

    const campaignId = app.batch?.campaign_id;
    const items = app.application_items.filter((i) => i.quantity_approved > 0);
    if (!campaignId || items.length === 0) {
      return back(
        "error",
        "This application has no approved copies to hand out.",
      );
    }

    // Acts as a lock: only one click can move it from approved to fulfilled
    const { data: locked, error: lockError } = await supabase
      .from("applications")
      .update({ status: "fulfilled", admin_notes: notes || app.reference })
      .eq("id", id)
      .eq("status", "approved")
      .select("id")
      .maybeSingle<{ id: string }>();

    if (lockError || !locked) {
      return back("error", "This application is no longer approved.");
    }

    const revert = async () => {
      await supabase
        .from("applications")
        .update({ status: "approved", fulfilled_at: null })
        .eq("id", id);
    };

    let beneficiaryId: string;

    const { data: existing } = await supabase
      .from("beneficiaries")
      .select("id")
      .eq("application_id", id)
      .maybeSingle<{ id: string }>();

    if (existing) {
      beneficiaryId = existing.id;
    } else {
      const { data: created, error } = await supabase
        .from("beneficiaries")
        .insert({
          name: app.organisation_name ?? app.applicant_name,
          type: app.applicant_type,
          location: `${app.city}, ${app.state}`,
          application_id: id,
        })
        .select("id")
        .single<{ id: string }>();

      if (error || !created) {
        await revert();
        return back("error", "The beneficiary record could not be created.");
      }
      beneficiaryId = created.id;
    }

    const { data: distribution, error: distError } = await supabase
      .from("distributions")
      .insert({
        campaign_id: campaignId,
        beneficiary_id: beneficiaryId,
        notes: `Application ${app.reference}`,
        recorded_by: actor.user.id,
      })
      .select("id")
      .single<{ id: string }>();

    if (distError || !distribution) {
      await revert();
      return back("error", "The distribution could not be recorded.");
    }

    const { error: itemsError } = await supabase
      .from("distribution_items")
      .insert(
        items.map((i) => ({
          distribution_id: distribution.id,
          batch_book_id: i.batch_book_id,
          quantity: i.quantity_approved,
        })),
      );

    if (itemsError) {
      await supabase.from("distributions").delete().eq("id", distribution.id);
      await revert();
      return back("error", "The distribution could not be recorded.");
    }

    const total = items.reduce((s, i) => s + i.quantity_approved, 0);

    await logAudit(supabase, actor, {
      action: "application.fulfilled",
      entity: "application",
      entityId: id,
      summary: `Fulfilled application ${app.reference} (${total} copies)`,
      details: {
        distribution_id: distribution.id,
        beneficiary_id: beneficiaryId,
      },
    });

    revalidatePath(`/admin/campaigns/${campaignId}/distributions`);
    refresh(id);
    return back(
      "notice",
      "Marked as fulfilled. The distribution has been recorded.",
    );
  }

  return back("error", "Unknown action.");
}
