import { notFound } from "next/navigation";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { PageHeader, Panel, StatusText } from "@/components/admin/ui";
import { campaignStatus } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatNaira } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { completeCampaign, setCampaignActive } from "../actions";

export const metadata = {
  title: "Edit campaign",
  robots: { index: false, follow: false },
};

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  target_kobo: number;
  is_active: boolean;
  completed_at: string | null;
};

const outline =
  "border border-navy px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";

export default async function EditCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, title, description, image_url, target_kobo, is_active, completed_at",
    )
    .eq("id", id)
    .maybeSingle<Campaign>();

  if (!campaign) notFound();

  const { data: totals } = await supabase
    .from("admin_campaign_totals")
    .select("raised_kobo, supporters")
    .eq("campaign_id", id)
    .maybeSingle<{ raised_kobo: number; supporters: number }>();

  const raised = totals?.raised_kobo ?? 0;
  const percent =
    campaign.target_kobo > 0
      ? Math.min(100, Math.round((raised / campaign.target_kobo) * 100))
      : 0;
  const completed = campaign.completed_at !== null;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={campaign.title} />

      {error && <FormMessage error={error} />}

      <Panel title="Progress">
        <div
          role="progressbar"
          aria-label="Campaign progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-3 w-full overflow-hidden bg-gold-soft"
        >
          <div className="h-full bg-navy" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {formatNaira(raised)} of {formatNaira(campaign.target_kobo)} (
          {percent}%) · {totals?.supporters ?? 0} supporters
        </p>
      </Panel>

      <Panel title="Status">
        <p className="text-sm text-ink">
          This campaign is <StatusText status={campaignStatus(campaign)} />.
        </p>

        {completed ? (
          <p className="mt-3 text-sm text-muted">
            Completed campaigns stay in the records and count towards
            &ldquo;Completed batches&rdquo;. Create a new campaign to start
            another.
          </p>
        ) : (
          <div className="mt-5 flex flex-wrap items-start gap-4">
            <form action={setCampaignActive}>
              <input type="hidden" name="id" value={campaign.id} />
              <input
                type="hidden"
                name="active"
                value={String(!campaign.is_active)}
              />
              <button type="submit" className={outline}>
                {campaign.is_active ? "Deactivate" : "Activate"}
              </button>
            </form>

            <form action={completeCampaign}>
              <input type="hidden" name="id" value={campaign.id} />
              <button type="submit" className={outline}>
                Mark as completed
              </button>
            </form>
          </div>
        )}

        {!completed && (
          <p className="mt-4 max-w-md text-xs leading-relaxed text-muted">
            Marking a campaign completed deactivates it and counts it as a
            completed batch. Do this once the target is reached and the books
            have been bought. It cannot be undone here.
          </p>
        )}
      </Panel>

      <section>
        <h2 className="mb-5 font-display text-xl text-navy">Details</h2>
        <CampaignForm
          campaign={{
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            target_kobo: campaign.target_kobo,
            is_active: campaign.is_active,
            image_url: campaign.image_url,
            completed,
          }}
        />
      </section>
    </div>
  );
}
