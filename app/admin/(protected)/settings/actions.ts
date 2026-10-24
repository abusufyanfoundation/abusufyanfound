"use server";

import { revalidatePath, updateTag } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { diffFields } from "@/lib/admin/diff";
import { requireSuperAdmin } from "@/lib/auth/require-admin";
import { SETTINGS_FIELDS, type SettingsRow } from "@/lib/data/settings";
import type { FormState } from "@/lib/forms/types";
import { createClient } from "@/lib/supabase/server";
import { siteSettingsSchema } from "@/lib/validation/admin";

const GENERIC = "The settings could not be saved. Please try again.";

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim() || undefined;
const on = (formData: FormData, key: string) => formData.get(key) === "on";
const onOff = (value: boolean) => (value ? "On" : "Off");

// One number per line; blank lines and stray spaces are dropped
const lines = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n") || undefined;

// Plain-language values for the activity log
function describe(r: SettingsRow): Record<string, string> {
  return {
    "Site name": r.site_name,
    "Site description": r.site_description,
    "Contact email": r.contact_email ?? "",
    "Contact phone": (r.contact_phone ?? "").split("\n").join(", "),
    "Contact address": r.contact_address ?? "",
    Facebook: r.facebook_url ?? "",
    "WhatsApp group": r.whatsapp_url ?? "",
    Instagram: r.instagram_url ?? "",
    YouTube: r.youtube_url ?? "",
    "Announcement banner": onOff(r.announcement_enabled),
    "Announcement text": r.announcement_text ?? "",
    "Announcement link label": r.announcement_link_label ?? "",
    "Announcement link": r.announcement_link_href ?? "",
    "Donations paused": onOff(r.donations_paused),
    "Donations paused message": r.donations_paused_message ?? "",
    "Applications paused": onOff(r.applications_paused),
    "Applications paused message": r.applications_paused_message ?? "",
    "School copy limit (book requests)": String(r.school_request_max_copies),
    "Minimum donation": `₦${r.min_donation_naira.toLocaleString("en-NG")}`,
    "Foundation bank": r.bank_name ?? "",
    "Foundation account number": r.bank_account_number ?? "",
    "Foundation account name": r.bank_account_name ?? "",
    "Book pre-fund bank": r.book_bank_name ?? "",
    "Book pre-fund account number": r.book_bank_account_number ?? "",
    "Book pre-fund account name": r.book_bank_account_name ?? "",
    "Campaign giving by Paystack": onOff(r.campaign_online_enabled),
    "Campaign giving by bank transfer": onOff(r.campaign_transfer_enabled),
    "Book pre-fund by Paystack": onOff(r.books_online_enabled),
    "Book pre-fund by bank transfer": onOff(r.books_transfer_enabled),
  };
}

export async function saveSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireSuperAdmin();

  const parsed = siteSettingsSchema.safeParse({
    siteName: text(formData, "siteName"),
    siteDescription: text(formData, "siteDescription"),
    schoolRequestMaxCopies: Number(formData.get("schoolRequestMaxCopies")),
    contactEmail: text(formData, "contactEmail"),
    contactPhone: lines(formData, "contactPhone"),
    contactAddress: text(formData, "contactAddress"),
    facebookUrl: text(formData, "facebookUrl"),
    whatsappUrl: text(formData, "whatsappUrl"),
    instagramUrl: text(formData, "instagramUrl"),
    youtubeUrl: text(formData, "youtubeUrl"),
    announcementEnabled: on(formData, "announcementEnabled"),
    announcementText: text(formData, "announcementText"),
    announcementLinkLabel: text(formData, "announcementLinkLabel"),
    announcementLinkHref: text(formData, "announcementLinkHref"),
    donationsPaused: on(formData, "donationsPaused"),
    donationsPausedMessage: text(formData, "donationsPausedMessage"),
    applicationsPaused: on(formData, "applicationsPaused"),
    applicationsPausedMessage: text(formData, "applicationsPausedMessage"),
    minDonationNaira: Number(formData.get("minDonationNaira")),
    bankName: text(formData, "bankName"),
    bankAccountNumber: text(formData, "bankAccountNumber"),
    bankAccountName: text(formData, "bankAccountName"),
    bookBankName: text(formData, "bookBankName"),
    bookBankAccountNumber: text(formData, "bookBankAccountNumber"),
    bookBankAccountName: text(formData, "bookBankAccountName"),
    campaignOnlineEnabled: on(formData, "campaignOnlineEnabled"),
    campaignTransferEnabled: on(formData, "campaignTransferEnabled"),
    booksOnlineEnabled: on(formData, "booksOnlineEnabled"),
    booksTransferEnabled: on(formData, "booksTransferEnabled"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("site_settings")
    .select(SETTINGS_FIELDS)
    .eq("id", 1)
    .maybeSingle<SettingsRow>();

  if (!before) {
    return {
      error:
        "The settings have not been set up yet. Run the site settings SQL first.",
    };
  }

  const after: SettingsRow = {
    site_name: v.siteName,
    site_description: v.siteDescription,
    school_request_max_copies: v.schoolRequestMaxCopies,
    contact_email: v.contactEmail ?? null,
    contact_phone: v.contactPhone ?? null,
    contact_address: v.contactAddress ?? null,
    facebook_url: v.facebookUrl ?? null,
    whatsapp_url: v.whatsappUrl ?? null,
    instagram_url: v.instagramUrl ?? null,
    youtube_url: v.youtubeUrl ?? null,
    announcement_enabled: v.announcementEnabled,
    announcement_text: v.announcementText ?? null,
    announcement_link_label: v.announcementLinkLabel ?? null,
    announcement_link_href: v.announcementLinkHref ?? null,
    donations_paused: v.donationsPaused,
    donations_paused_message: v.donationsPausedMessage ?? null,
    applications_paused: v.applicationsPaused,
    applications_paused_message: v.applicationsPausedMessage ?? null,
    min_donation_naira: v.minDonationNaira,
    bank_name: v.bankName ?? null,
    bank_account_number: v.bankAccountNumber ?? null,
    bank_account_name: v.bankAccountName ?? null,
    book_bank_name: v.bookBankName ?? null,
    book_bank_account_number: v.bookBankAccountNumber ?? null,
    book_bank_account_name: v.bookBankAccountName ?? null,
    campaign_online_enabled: v.campaignOnlineEnabled,
    campaign_transfer_enabled: v.campaignTransferEnabled,
    books_online_enabled: v.booksOnlineEnabled,
    books_transfer_enabled: v.booksTransferEnabled,
  };

  const changes = diffFields(describe(before), describe(after));
  if (changes.length === 0) return { message: "No changes to save." };

  // RLS lets only a super admin update this row. No row back means it was refused.
  const { data: saved, error } = await supabase
    .from("site_settings")
    .update({
      ...after,
      updated_at: new Date().toISOString(),
      updated_by: actor.user.id,
    })
    .eq("id", 1)
    .select("id")
    .maybeSingle();

  if (error || !saved) {
    console.error("saveSettings:", error?.message ?? "no row updated");
    return { error: GENERIC };
  }

  await logAudit(supabase, actor, {
    action: "settings.updated",
    entity: "settings",
    entityId: "1",
    summary: `Updated site settings (${changes.map((c) => c.field).join(", ")})`,
    details: { changes },
  });

  // Clear the cached copy so visitors see the change straight away
  updateTag("site-settings");
  revalidatePath("/", "layout");

  return { message: "Settings saved." };
}
