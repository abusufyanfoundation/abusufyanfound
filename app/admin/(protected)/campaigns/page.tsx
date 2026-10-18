import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  EmptyState,
  PageHeader,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { campaignStatus } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDate } from "@/lib/format";
import { formatNaira } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Campaigns",
  robots: { index: false, follow: false },
};

type Row = {
  id: string;
  title: string;
  campaign_type: string;
  is_active: boolean;
  completed_at: string | null;
  target_kobo: number;
  created_at: string;
  batches: { id: string; target_kobo: number }[];
};

type Totals = { campaign_id: string; raised_kobo: number };
type BatchTotals = { batch_id: string; raised_kobo: number };

const tabs = [
  { label: "All", href: "/admin/campaigns", value: undefined },
  { label: "General", href: "/admin/campaigns?type=normal", value: "normal" },
  {
    label: "Batch-based",
    href: "/admin/campaigns?type=batch",
    value: "batch",
  },
];

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const type =
    sp.type === "normal" || sp.type === "batch" ? sp.type : undefined;
  const supabase = await createClient();

  let query = supabase
    .from("campaigns")
    .select(
      "id, title, campaign_type, is_active, completed_at, target_kobo, created_at, batches(id, target_kobo)",
    );
  if (type) query = query.eq("campaign_type", type);

  const [campaigns, totals, batchTotals] = await Promise.all([
    query.order("created_at", { ascending: false }).returns<Row[]>(),
    supabase
      .from("admin_campaign_totals")
      .select("campaign_id, raised_kobo")
      .returns<Totals[]>(),
    supabase
      .from("admin_batch_totals")
      .select("batch_id, raised_kobo")
      .returns<BatchTotals[]>(),
  ]);

  const byId = new Map((totals.data ?? []).map((t) => [t.campaign_id, t]));
  const batchRaised = new Map(
    (batchTotals.data ?? []).map((t) => [t.batch_id, t.raised_kobo]),
  );
  const rows = campaigns.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Campaigns"
        intro="A campaign is a fund with a target. General campaigns raise money on their own; batch-based campaigns raise money batch by batch to buy books for applicants. Only one campaign can be active at a time."
        action={{ label: "New campaign", href: "/admin/campaigns/new" }}
      />

      <nav
        aria-label="Campaign type"
        className="flex gap-6 border-b border-rule text-sm"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`-mb-px border-b-2 pb-3 ${
              tab.value === type
                ? "border-gold font-medium text-navy"
                : "border-transparent text-muted hover:text-navy"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState
          title={type ? "No campaigns of this type" : "No campaigns yet"}
          text={
            type
              ? "Switch to All to see every campaign."
              : "Create your first campaign to start collecting donations."
          }
          action={{ label: "Create a campaign", href: "/admin/campaigns/new" }}
        />
      ) : (
        <TableWrap>
          <thead className="border-b border-rule bg-paper">
            <tr>
              <th className={th}>Campaign</th>
              <th className={th}>Status</th>
              <th className={th}>Raised</th>
              <th className={th}>Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {rows.map((c) => {
              const isBatch = c.campaign_type === "batch";
              const raised = isBatch
                ? c.batches.reduce(
                    (s, b) => s + (batchRaised.get(b.id) ?? 0),
                    0,
                  )
                : (byId.get(c.id)?.raised_kobo ?? 0);
              const target = isBatch
                ? c.batches.reduce((s, b) => s + b.target_kobo, 0)
                : c.target_kobo;
              const batchCount = c.batches.length;
              return (
                <tr key={c.id}>
                  <td className={td}>
                    <Link
                      href={`/admin/campaigns/${c.id}`}
                      className="font-medium text-navy underline decoration-gold underline-offset-4"
                    >
                      {c.title}
                    </Link>
                    <div className="mt-1 text-xs text-muted">
                      {isBatch
                        ? `Batch-based · ${batchCount} ${batchCount === 1 ? "batch" : "batches"}`
                        : "General"}
                    </div>
                  </td>
                  <td className={td}>
                    <StatusText status={campaignStatus(c)} />
                  </td>
                  <td className={`${td} min-w-48`}>
                    {formatNaira(raised)} of {formatNaira(target)}
                    {target > 0 && (
                      <div className="mt-2">
                        <ProgressBar raisedKobo={raised} targetKobo={target} />
                      </div>
                    )}
                  </td>
                  <td className={td}>{formatDate(c.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
