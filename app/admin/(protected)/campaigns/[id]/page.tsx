import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import {
  PageHeader,
  Panel,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { campaignStatus, titleCase } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatNaira } from "@/lib/money";
import { campaignPath } from "@/lib/share";
import { createClient } from "@/lib/supabase/server";
import {
  completeCampaign,
  saveCampaignRaised,
  setCampaignActive,
} from "../actions";

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
  campaign_type: string;
};

type BatchRow = {
  id: string;
  batch_number: number;
  title: string;
  status: string;
  target_kobo: number;
  applications: { count: number }[];
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
    notice?: string;
  }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error, notice } = await searchParams;

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, title, slug, description, image_url, target_kobo, is_active, completed_at, campaign_type",
    )
    .eq("id", id)
    .maybeSingle<Campaign>();

  if (!campaign) {
    notFound();
  }

  const { data: totals } = await supabase
    .from("admin_campaign_totals")
    .select("raised_kobo")
    .eq("campaign_id", id)
    .maybeSingle<{ raised_kobo: number }>();

  const { data: batchRows } = await supabase
    .from("batches")
    .select("id, batch_number, title, status, target_kobo, applications(count)")
    .eq("campaign_id", id)
    .order("batch_number")
    .returns<BatchRow[]>();
  const batches = batchRows ?? [];

  const { data: batchTotals } = await supabase
    .from("admin_batch_totals")
    .select("batch_id, raised_kobo")
    .in(
      "batch_id",
      batches.map((b) => b.id),
    )
    .returns<{ batch_id: string; raised_kobo: number }[]>();
  const batchRaised = new Map(
    (batchTotals ?? []).map((t) => [t.batch_id, t.raised_kobo]),
  );
  const batchesRaised = batches.reduce(
    (s, b) => s + (batchRaised.get(b.id) ?? 0),
    0,
  );
  const batchesTarget = batches.reduce((s, b) => s + b.target_kobo, 0);

  const raised = totals?.raised_kobo ?? 0;

  const completed = campaign.completed_at !== null;

  const isBatch = campaign.campaign_type === "batch";

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{
          label: "Back to campaigns",
          href: "/admin/campaigns",
        }}
        title={campaign.title}
        intro={
          campaign.campaign_type === "batch"
            ? "Batch-based campaign"
            : "General campaign"
        }
      />

      {error && <FormMessage error={error} />}
      {notice && <FormMessage message={notice} />}

      {!isBatch && (
        <Panel title="Amount raised">
          <ProgressBar raisedKobo={raised} targetKobo={campaign.target_kobo} />

          <p className="mt-1 text-sm text-muted">
            {formatNaira(raised)} of {formatNaira(campaign.target_kobo)}
          </p>

          <form
            action={saveCampaignRaised}
            className="mt-5 flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="id" value={campaign.id} />
            <label className="flex flex-col gap-2 text-sm font-medium text-ink">
              Total raised so far (₦)
              <input
                name="raisedNaira"
                type="number"
                min={0}
                step="any"
                required
                defaultValue={raised / 100}
                className="border border-rule bg-white px-3.5 py-3 text-base text-ink focus:border-navy"
              />
            </label>
            <button type="submit" className={`${outline} py-3.5`}>
              Save amount
            </button>
          </form>

          <p className="mt-4 max-w-md text-xs leading-relaxed text-muted">
            Type the total from the bank account (Paystack payouts included).
            The website shows the raised figure only once it reaches the target.
          </p>
        </Panel>
      )}
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
            Completed campaigns stay in the records. Their batches count towards
            &ldquo;Completed batches&rdquo; once they are fulfilled.
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

            {!isBatch && (
              <form action={completeCampaign}>
                <input type="hidden" name="id" value={campaign.id} />

                <button type="submit" className={outline}>
                  Mark as completed
                </button>
              </form>
            )}
          </div>
        )}

        <Link
          href={`/admin/campaigns/${campaign.id}/distributions`}
          className="mt-5 inline-block text-sm text-navy underline decoration-gold underline-offset-4"
        >
          View campaign distributions
        </Link>

        {!completed && !isBatch && (
          <p className="mt-4 max-w-md text-xs leading-relaxed text-muted">
            Marking a campaign completed deactivates it so its batches can open
            for applications. Do this once the target is reached and the books
            have been bought. It cannot be undone here.
          </p>
        )}
      </Panel>

      {isBatch && (
        <Panel title="Batches">
          <p className="text-sm text-ink">
            {formatNaira(batchesRaised)} raised across {batches.length}{" "}
            {batches.length === 1 ? "batch" : "batches"}
            {batchesTarget > 0 && (
              <> of {formatNaira(batchesTarget)} targeted</>
            )}
          </p>
          {batchesTarget > 0 && (
            <div className="mt-3">
              <ProgressBar
                raisedKobo={batchesRaised}
                targetKobo={batchesTarget}
              />
            </div>
          )}

          {batches.length ? (
            <div className="mt-5">
              <TableWrap>
                <thead className="border-b border-rule bg-paper">
                  <tr>
                    <th className={th}>Batch</th>
                    <th className={th}>Status</th>
                    <th className={th}>Raised</th>
                    <th className={th}>Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {batches.map((b) => (
                    <tr key={b.id}>
                      <td className={td}>
                        <Link
                          href={`/admin/batches/${b.id}`}
                          className="font-medium text-navy underline decoration-gold underline-offset-4"
                        >
                          Batch {b.batch_number}: {b.title}
                        </Link>
                      </td>
                      <td className={td}>
                        <StatusText status={titleCase(b.status)} />
                      </td>
                      <td className={`${td} min-w-48`}>
                        {formatNaira(batchRaised.get(b.id) ?? 0)} of{" "}
                        {formatNaira(b.target_kobo)}
                        <div className="mt-2">
                          <ProgressBar
                            raisedKobo={batchRaised.get(b.id) ?? 0}
                            targetKobo={b.target_kobo}
                          />
                        </div>
                      </td>
                      <td className={td}>{b.applications[0]?.count ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No batches yet.</p>
          )}

          <Link
            href={`/admin/batches/new?campaign=${campaign.id}`}
            className={`${outline} mt-5 inline-block`}
          >
            New batch
          </Link>
        </Panel>
      )}

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
            campaignType: campaign.campaign_type,
          }}
        />
      </section>
    </div>
  );
}
