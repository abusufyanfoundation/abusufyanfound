import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireSuperAdmin } from "@/lib/auth/require-admin";
import { SETTINGS_FIELDS, type SettingsRow } from "@/lib/data/settings";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Site settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  await requireSuperAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select(SETTINGS_FIELDS)
    .eq("id", 1)
    .maybeSingle<SettingsRow>();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Site settings"
        intro="Change what visitors see without touching Supabase or the code. Changes go live as soon as you save."
      />

      {data ? (
        <SettingsForm settings={data} />
      ) : (
        <EmptyState
          title="Settings are not set up yet"
          text="Run the site settings SQL in Supabase, then reload this page."
        />
      )}
    </div>
  );
}
