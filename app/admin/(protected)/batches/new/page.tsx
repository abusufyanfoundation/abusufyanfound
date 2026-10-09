import { BatchForm } from "@/components/admin/BatchForm";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "New batch",
  robots: { index: false, follow: false },
};

type Campaign = {
  id: string;
  title: string;
  campaign_type: string;
  completed_at: string | null;
};

export default async function NewBatchPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("campaigns")
    .select("id, title, campaign_type, completed_at")
    .order("created_at", { ascending: false })
    .returns<Campaign[]>();

  const campaigns = (data ?? []).map((c) => ({
    value: c.id,
    label: `${c.title}${c.campaign_type === "batch" ? " (batch campaign)" : ""}${c.completed_at ? " — completed" : ""}`,
  }));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{ label: "Back to batches", href: "/admin/batches" }}
        title="New batch"
        intro="You can prepare a batch and add its books while the campaign is still running. It only opens for applications once the campaign is completed."
      />

      {campaigns.length ? (
        <BatchForm campaigns={campaigns} />
      ) : (
        <EmptyState
          title="No campaigns yet"
          text="Create a campaign first. A batch is always bought with a campaign's funds."
          action={{ label: "Create a campaign", href: "/admin/campaigns/new" }}
        />
      )}
    </div>
  );
}
