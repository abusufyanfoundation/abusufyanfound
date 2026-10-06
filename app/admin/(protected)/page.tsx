import {
  EmptyState,
  PageHeader,
  Panel,
  Stat,
  TableWrap,
  StatusText,
  td,
  th,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/require-admin";
import { stockReason } from "@/lib/admin/labels";
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
  awaiting_payment: number;
  to_fulfil: number;
  needs_refund: number;
};

type RecentDonation = {
  id: string;
  created_at: string;
  type: "general" | "book";
  donor_name: string;
  amount_kobo: number;
  is_paid: boolean;
};

type StockChange = {
  id: string;
  created_at: string;
  delta: number;
  reason: string;
  book: { title: string } | null;
};

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [overview, campaignRes, donations, stock] = await Promise.all([
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
      .from("book_inventory")
      .select("id, created_at, delta, reason, book:books(title)")
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<StockChange[]>(),
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
  const percent =
    campaign && campaign.target_kobo > 0
      ? Math.min(100, Math.round((raised / campaign.target_kobo) * 100))
      : 0;

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
          The overview figures could not be loaded. Check that the Phase 5 SQL
          has been run.
        </p>
      )}

      <dl className="flex flex-wrap gap-x-8 gap-y-8">
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
        <Stat
          label="Awaiting payment"
          value={String(o?.awaiting_payment ?? 0)}
        />
        <Stat label="Orders to fulfil" value={String(o?.to_fulfil ?? 0)} />
      </dl>

      {(o?.needs_refund ?? 0) > 0 && (
        <p
          role="status"
          className="border-l-2 border-gold bg-gold-soft px-4 py-3 text-sm text-ink"
        >
          {o?.needs_refund}{" "}
          {o?.needs_refund === 1 ? "order needs" : "orders need"} a refund: the
          payment arrived after the books had gone.
        </p>
      )}

      <Panel title="Current campaign">
        {campaign ? (
          <>
            <p className="font-display text-2xl text-navy">{campaign.title}</p>
            <div
              role="progressbar"
              aria-label="Campaign progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              className="mt-4 h-3 w-full overflow-hidden bg-gold-soft"
            >
              <div
                className="h-full bg-navy"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              {formatNaira(raised)} of {formatNaira(campaign.target_kobo)} (
              {percent}%) · {totals?.supporters ?? 0} supporters
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
        <h2 className="mb-4 font-display text-xl text-navy">
          Recent stock changes
        </h2>
        {stock.data && stock.data.length > 0 ? (
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Book</th>
                <th className={th}>Change</th>
                <th className={th}>Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {stock.data.map((s) => (
                <tr key={s.id}>
                  <td className={td}>{formatDateTime(s.created_at)}</td>
                  <td className={td}>{s.book?.title ?? "Deleted book"}</td>
                  <td className={td}>
                    {s.delta > 0 ? `+${s.delta}` : s.delta}
                  </td>
                  <td className={td}>{stockReason(s.reason)}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        ) : (
          <EmptyState
            title="No stock changes yet"
            text="Stock changes appear here when books are added, reserved or adjusted."
          />
        )}
      </section>
    </div>
  );
}
