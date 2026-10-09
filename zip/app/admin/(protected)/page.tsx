import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  EmptyState,
  PageHeader,
  Panel,
  Stat,
  StatGrid,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/format";
import { formatNaira } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

type Overview = {
  total_raised_kobo: number;
  paid_donations: number;
  books_listed: number;
  books_distributed: number;
  to_fulfil: number;
  completed_batches: number;
  active_campaigns: number;
};

type RecentDonation = {
  id: string;
  created_at: string;
  type: "general" | "book";
  donor_name: string;
  amount_kobo: number;
  is_paid: boolean;
};

type Activity = {
  id: string;
  created_at: string;
  actor_name: string | null;
  actor_email: string | null;
  summary: string;
};

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [overview, campaignRes, donations, activity] = await Promise.all([
    supabase.from("admin_overview").select("*").single<Overview>(),
    supabase
      .from("campaigns")
      .select("id, title, target_kobo")
      .eq("is_active", true)
      .maybeSingle<{ id: string; title: string; target_kobo: number }>(),
    supabase
      .from("donations")
      .select("id, created_at, type, donor_name, amount_kobo, is_paid")
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<RecentDonation[]>(),
    supabase
      .from("audit_log")
      .select("id, created_at, actor_name, actor_email, summary")
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<Activity[]>(),
  ]);

  const campaign = campaignRes.data;
  const totals = campaign
    ? (
        await supabase
          .from("admin_campaign_totals")
          .select("raised_kobo, supporters")
          .eq("campaign_id", campaign.id)
          .maybeSingle<{ raised_kobo: number; supporters: number }>()
      ).data
    : null;

  const o = overview.data;
  const raised = totals?.raised_kobo ?? 0;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Overview"
        intro="A quick look at donations, campaigns and books."
      />

      {overview.error && (
        <p
          role="alert"
          className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          The overview figures could not be loaded. Check that the latest SQL
          has been run.
        </p>
      )}

      <StatGrid>
        <Stat
          label="Total raised"
          value={formatNaira(o?.total_raised_kobo ?? 0)}
        />
        <Stat label="Paid donations" value={String(o?.paid_donations ?? 0)} />
        <Stat label="Books listed" value={String(o?.books_listed ?? 0)} />
        <Stat
          label="Books distributed"
          value={String(o?.books_distributed ?? 0)}
        />
        <Stat label="Orders to fulfil" value={String(o?.to_fulfil ?? 0)} />
        <Stat
          label="Completed batches"
          value={String(o?.completed_batches ?? 0)}
        />
        <Stat
          label="Active campaigns"
          value={String(o?.active_campaigns ?? 0)}
        />
      </StatGrid>

      <Panel title="Current campaign">
        {campaign ? (
          <>
            <p className="font-display text-2xl text-navy">{campaign.title}</p>
            <div className="mt-4">
              <ProgressBar
                raisedKobo={raised}
                targetKobo={campaign.target_kobo}
              />
            </div>
            <p className="mt-1 text-sm text-muted">
              {formatNaira(raised)} of {formatNaira(campaign.target_kobo)} ·{" "}
              {totals?.supporters ?? 0} supporters
            </p>
          </>
        ) : (
          <EmptyState
            title="No active campaign"
            text="Create a campaign or activate an existing one to show it on the website."
            action={{ label: "Go to campaigns", href: "/admin/campaigns" }}
          />
        )}
      </Panel>

      <section>
        <h2 className="mb-4 font-display text-xl text-navy">
          Recent donations
        </h2>
        {donations.data && donations.data.length > 0 ? (
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Donor</th>
                <th className={th}>Type</th>
                <th className={th}>Amount</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {donations.data.map((d) => (
                <tr key={d.id}>
                  <td className={td}>{formatDateTime(d.created_at)}</td>
                  <td className={td}>{d.donor_name}</td>
                  <td className={td}>
                    {d.type === "book" ? "Book pre-fund" : "Campaign"}
                  </td>
                  <td className={td}>{formatNaira(d.amount_kobo)}</td>
                  <td className={td}>
                    <StatusText status={d.is_paid ? "Paid" : "Pending"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        ) : (
          <EmptyState
            title="No donations yet"
            text="Donations will appear here as soon as the first one is made."
          />
        )}
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl text-navy">Recent activity</h2>
          <Link
            href="/admin/activity"
            className="text-sm text-navy underline decoration-gold underline-offset-4"
          >
            View all activity
          </Link>
        </div>
        {activity.data && activity.data.length > 0 ? (
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>When</th>
                <th className={th}>Admin</th>
                <th className={th}>What happened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {activity.data.map((a) => (
                <tr key={a.id}>
                  <td className={td}>{formatDateTime(a.created_at)}</td>
                  <td className={td}>
                    {a.actor_name ?? a.actor_email ?? "Unknown"}
                  </td>
                  <td className={td}>{a.summary}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        ) : (
          <EmptyState
            title="No activity yet"
            text="What admins do (creating campaigns, editing books, signing in) is recorded here."
          />
        )}
      </section>
    </div>
  );
}
