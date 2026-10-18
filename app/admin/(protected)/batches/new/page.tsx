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
  completed_at: string | null;
};

export default async function NewBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  await requireAdmin();
  const { campaign } = await searchParams;
  const supabase = await createClient();

  const [campaignsRes, batchesRes] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, title, completed_at")
      .eq("campaign_type", "batch")
      .order("created_at", { ascending: false })
      .returns<Campaign[]>(),
    supabase
      .from("batches")
      .select("campaign_id, batch_number")
      .returns<{ campaign_id: string; batch_number: number }[]>(),
  ]);

  const last = new Map<string, number>();
  for (const b of batchesRes.data ?? []) {
    last.set(
      b.campaign_id,
      Math.max(last.get(b.campaign_id) ?? 0, b.batch_number),
    );
  }

  const campaigns = (campaignsRes.data ?? []).map((c) => ({
    value: c.id,
    label: `${c.title} — next: Batch ${(last.get(c.id) ?? 0) + 1}${c.completed_at ? " (completed)" : ""}`,
  }));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{ label: "Back to batches", href: "/admin/batches" }}
        title="New batch"
        intro="You can prepare a batch and add its books while it is still raising funds. It only opens for applications once it reaches its funding target."
      />

      {campaigns.length ? (
        <BatchForm
          campaigns={campaigns}
          defaultCampaignId={campaigns.find((c) => c.value === campaign)?.value}
        />
      ) : (
        <EmptyState
          title="No batch-based campaigns yet"
          text="A batch is always bought with a batch-based campaign's funds. Create one first."
          action={{ label: "Create a campaign", href: "/admin/campaigns/new" }}
        />
      )}
    </div>
  );
}
