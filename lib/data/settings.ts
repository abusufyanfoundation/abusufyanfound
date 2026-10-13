import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { siteConfig } from "@/lib/site";

export const SETTINGS_FIELDS =
  "contact_email, contact_phone, contact_address, facebook_url, whatsapp_url, instagram_url, youtube_url, announcement_enabled, announcement_text, announcement_link_label, announcement_link_href, donations_paused, donations_paused_message, applications_paused, applications_paused_message, min_donation_naira, bank_name, bank_account_number, bank_account_name, book_bank_name, book_bank_account_number, book_bank_account_name, campaign_online_enabled, campaign_transfer_enabled, books_online_enabled, books_transfer_enabled";

export type SettingsRow = {
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  facebook_url: string | null;
  whatsapp_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  announcement_enabled: boolean;
  announcement_text: string | null;
  announcement_link_label: string | null;
  announcement_link_href: string | null;
  donations_paused: boolean;
  donations_paused_message: string | null;
  applications_paused: boolean;
  applications_paused_message: string | null;
  min_donation_naira: number;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  book_bank_name: string | null;
  book_bank_account_number: string | null;
  book_bank_account_name: string | null;
  campaign_online_enabled: boolean;
  campaign_transfer_enabled: boolean;
  books_online_enabled: boolean;
  books_transfer_enabled: boolean;
};

export type BankDetails = { bank: string; number: string; name: string };

export type SiteSettings = {
  contact: { email: string; phones: string[]; address: string };
  social: { label: string; href: string }[];
  announcement: {
    enabled: boolean;
    text: string;
    linkLabel: string;
    linkHref: string;
  };
  donations: { paused: boolean; message: string; minNaira: number };
  applications: { paused: boolean; message: string };
  payments: {
    campaign: { online: boolean; transfer: boolean; bank: BankDetails };
    books: { online: boolean; transfer: boolean; bank: BankDetails };
  };
};

// Standard wording, used when no message has been written
export const PAUSED = {
  donations:
    "We are not taking donations at the moment. Please check back soon.",
  applications:
    "Applications are paused at the moment. Please check back soon.",
};

const clean = (value: string | null | undefined) => value?.trim() ?? "";

export function fromRow(row: SettingsRow): SiteSettings {
  return {
    contact: {
      email: clean(row.contact_email),
      phones: clean(row.contact_phone)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
      address: clean(row.contact_address),
    },
    social: [
      { label: "Facebook", href: clean(row.facebook_url) },
      { label: "WhatsApp group", href: clean(row.whatsapp_url) },
      { label: "Instagram", href: clean(row.instagram_url) },
      { label: "YouTube", href: clean(row.youtube_url) },
    ].filter((item) => item.href),
    announcement: {
      enabled: row.announcement_enabled,
      text: clean(row.announcement_text),
      linkLabel: clean(row.announcement_link_label),
      linkHref: clean(row.announcement_link_href),
    },
    donations: {
      paused: row.donations_paused,
      message: clean(row.donations_paused_message),
      minNaira: row.min_donation_naira,
    },
    applications: {
      paused: row.applications_paused,
      message: clean(row.applications_paused_message),
    },
    payments: {
      campaign: {
        online: row.campaign_online_enabled,
        transfer: row.campaign_transfer_enabled,
        bank: {
          bank: clean(row.bank_name),
          number: clean(row.bank_account_number),
          name: clean(row.bank_account_name),
        },
      },
      books: {
        online: row.books_online_enabled,
        transfer: row.books_transfer_enabled,
        bank: {
          bank: clean(row.book_bank_name),
          number: clean(row.book_bank_account_number),
          name: clean(row.book_bank_account_name),
        },
      },
    },
  };
}

// Used only if the settings row cannot be read
const FALLBACK: SiteSettings = {
  contact: {
    email: siteConfig.contact.email ?? "",
    phones: siteConfig.contact.phone ? [siteConfig.contact.phone] : [],
    address: siteConfig.contact.address ?? "",
  },
  social: [...siteConfig.social],
  announcement: { enabled: false, text: "", linkLabel: "", linkHref: "" },
  donations: { paused: false, message: "", minNaira: 100 },
  applications: { paused: false, message: "" },
  payments: {
    campaign: {
      online: true,
      transfer: false,
      bank: { bank: "", number: "", name: "" },
    },
    books: {
      online: true,
      transfer: false,
      bank: { bank: "", number: "", name: "" },
    },
  },
};

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const { data, error } = await createPublicClient()
      .from("site_settings")
      .select(SETTINGS_FIELDS)
      .eq("id", 1)
      .maybeSingle<SettingsRow>();

    if (error) console.error("getSiteSettings:", error.message);
    return data ? fromRow(data) : FALLBACK;
  },
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 300 },
);
