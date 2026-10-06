import Link from "next/link";
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
  is_active: boolean;
  completed_at: string | null;
  target_kobo: number;
  created_at: string;
};

type Totals = { campaign_id: string; raised_kobo: number; supporters: number };

export default async function AdminCampaignsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [campaigns, totals] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, title, is_active, completed_at, target_kobo, created_at")
      .order("created_at", { ascending: false })
      .returns<Row[]>(),
    supabase
      .from("admin_campaign_totals")
      .select("campaign_id, raised_kobo, supporters")
      .returns<Totals[]>(),
  ]);

  const byId = new Map((totals.data ?? []).map((t) => [t.campaign_id, t]));
  const rows = campaigns.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Campaigns"
        intro="Campaigns are general funds with a target. Only one can be active at a time."
        action={{ label: "New campaign", href: "/admin/campaigns/new" }}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          text="Create your first campaign to start collecting donations."
          action={{ label: "Create a campaign", href: "/admin/campaigns/new" }}
        />
      ) : (
        <TableWrap>
          <thead className="border-b border-rule bg-paper">
            <tr>
              <th className={th}>Campaign</th>
              <th className={th}>Status</th>
              <th className={th}>Raised</th>
              <th className={th}>Supporters</th>
              <th className={th}>Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {rows.map((c) => {
              const t = byId.get(c.id);
              const raised = t?.raised_kobo ?? 0;
              const percent =
                c.target_kobo > 0
                  ? Math.min(100, Math.round((raised / c.target_kobo) * 100))
                  : 0;
              return (
                <tr key={c.id}>
                  <td className={td}>
                    <Link
                      href={`/admin/campaigns/${c.id}`}
                      className="font-medium text-navy underline decoration-gold underline-offset-4"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className={td}>
                    <StatusText status={campaignStatus(c)} />
                  </td>
                  <td className={td}>
                    {formatNaira(raised)} of {formatNaira(c.target_kobo)}
                    <span className="text-muted"> ({percent}%)</span>
                  </td>
                  <td className={td}>{t?.supporters ?? 0}</td>
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
