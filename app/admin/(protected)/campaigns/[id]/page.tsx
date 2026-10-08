import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { PageHeader, Panel, StatusText } from "@/components/admin/ui";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { campaignStatus } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatNaira } from "@/lib/money";
import { campaignPath } from "@/lib/share";
import { createClient } from "@/lib/supabase/server";
import { completeCampaign, setCampaignActive } from "../actions";

export const metadata = {
  title: "Edit campaign",
  robots: {
    index: false,
    follow: false,
  },
};

type Campaign = {
  id: string;
  title: string;
  slug: string;
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
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error } = await searchParams;

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, title, slug, description, image_url, target_kobo, is_active, completed_at",
    )
    .eq("id", id)
    .maybeSingle<Campaign>();

  if (!campaign) {
    notFound();
  }

  const { data: totals } = await supabase
    .from("admin_campaign_totals")
    .select("raised_kobo, supporters")
    .eq("campaign_id", id)
    .maybeSingle<{
      raised_kobo: number;
      supporters: number;
    }>();

  const raised = totals?.raised_kobo ?? 0;

  const completed = campaign.completed_at !== null;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{
          label: "Back to campaigns",
          href: "/admin/campaigns",
        }}
        title={campaign.title}
      />

      {error && <FormMessage error={error} />}

      <Panel title="Progress">
        <ProgressBar raisedKobo={raised} targetKobo={campaign.target_kobo} />

        <p className="mt-1 text-sm text-muted">
          {formatNaira(raised)} of {formatNaira(campaign.target_kobo)} ·{" "}
          {totals?.supporters ?? 0} supporters
        </p>
      </Panel>

      <Panel title="Status">
        <p className="text-sm text-ink">
          This campaign is <StatusText status={campaignStatus(campaign)} />.
        </p>

        {campaign.is_active && (
          <p className="mt-3 text-sm text-muted">
            Public page:{" "}
            <Link
              href={campaignPath(campaign.slug)}
              className="text-navy underline decoration-gold underline-offset-4"
            >
              {campaignPath(campaign.slug)}
            </Link>
            . Share this link to show the campaign image and caption on social
            media.
          </p>
        )}

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

        <Link
          href={`/admin/campaigns/${campaign.id}/distributions`}
          className="mt-5 inline-block text-sm text-navy underline decoration-gold underline-offset-4"
        >
          View campaign distributions
        </Link>

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
