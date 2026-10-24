import Link from "next/link";
import {
  EmptyState,
  PageHeader,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { campaignStatus, titleCase } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Batches",
  robots: { index: false, follow: false },
};

type Campaign = {
  id: string;
  title: string;
  is_active: boolean;
  completed_at: string | null;
  reference_code: string | null;
  created_at: string;
};

type Row = {
  id: string;
  batch_number: number;
  title: string;
  status: string;
  closes_at: string | null;
  campaign: Campaign | null;
  batch_books: { quantity_available: number }[];
  applications: { count: number }[];
};

export default async function AdminBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const campaignId =
    sp.campaign && /^[0-9a-f-]{36}$/i.test(sp.campaign)
      ? sp.campaign
      : undefined;
  const supabase = await createClient();

  let query = supabase
    .from("batches")
    .select(
      "id, batch_number, title, status, closes_at, campaign:campaigns(id, title, is_active, completed_at, reference_code, created_at), batch_books(quantity_available), applications(count)",
    );
  if (campaignId) query = query.eq("campaign_id", campaignId);

  const { data, error } = await query.returns<Row[]>();

  // One block per campaign: the active one first, then the newest campaigns.
  // Inside each block the latest batch comes first.
  const groups = new Map<string, { campaign: Campaign | null; rows: Row[] }>();
  for (const b of data ?? []) {
    const key = b.campaign?.id ?? "none";
    const group = groups.get(key) ?? { campaign: b.campaign, rows: [] };
    group.rows.push(b);
    groups.set(key, group);
  }

  const sections = [...groups.values()]
    .map((g) => ({
      campaign: g.campaign,
      rows: [...g.rows].sort((a, b) => b.batch_number - a.batch_number),
    }))
    .sort((a, b) => {
      const active =
        Number(b.campaign?.is_active ?? false) -
        Number(a.campaign?.is_active ?? false);
      if (active !== 0) return active;
      return (b.campaign?.created_at ?? "").localeCompare(
        a.campaign?.created_at ?? "",
      );
    });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Batches"
        intro="A batch is the list of books bought with a campaign's funds. Individuals, mosques and schools apply for copies from an open batch."
        action={{ label: "New batch", href: "/admin/batches/new" }}
      />

      {campaignId && data?.[0]?.campaign && (
        <p className="text-sm text-muted">
          Showing batches of {data[0].campaign.title}.{" "}
          <Link
            href="/admin/batches"
            className="text-navy underline decoration-gold underline-offset-4"
          >
            Show all batches
          </Link>
        </p>
      )}

      {error ? (
        <p
          role="alert"
          className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Batches could not be loaded.
        </p>
      ) : sections.length ? (
        <div className="flex flex-col gap-10">
          {sections.map(({ campaign, rows }) => (
            <section key={campaign?.id ?? "none"}>
              <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border border-b-0 border-rule bg-paper px-4 py-4">
                <div>
                  {campaign ? (
                    <Link
                      href={`/admin/campaigns/${campaign.id}`}
                      className="font-display text-xl text-navy underline decoration-gold underline-offset-4"
                    >
                      {campaign.title}
                    </Link>
                  ) : (
                    <p className="font-display text-xl text-navy">
                      No campaign
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {rows.length} {rows.length === 1 ? "batch" : "batches"}
                    {campaign?.reference_code &&
                      ` · Code ${campaign.reference_code}`}
                  </p>
                </div>
                {campaign && (
                  <div className="flex items-center gap-5 text-sm">
                    <StatusText status={campaignStatus(campaign)} />
                    <Link
                      href={`/admin/batches/new?campaign=${campaign.id}`}
                      className="text-navy underline decoration-gold underline-offset-4"
                    >
                      New batch
                    </Link>
                  </div>
                )}
              </header>

              <TableWrap>
                <thead className="border-b border-rule bg-paper">
                  <tr>
                    <th className={th}>Batch</th>
                    <th className={th}>Status</th>
                    <th className={th}>In stock</th>
                    <th className={th}>Applications</th>
                    <th className={th}>Closes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {rows.map((b) => (
                    <tr key={b.id}>
                      <td className={td}>
                        <Link
                          href={`/admin/batches/${b.id}`}
                          className="font-medium text-navy underline decoration-gold underline-offset-4"
                        >
                          {b.title}
                        </Link>
                        <div className="mt-1 text-xs text-muted">
                          Batch {b.batch_number}
                        </div>
                      </td>
                      <td className={td}>
                        <StatusText status={titleCase(b.status)} />
                      </td>
                      <td className={td}>
                        {b.batch_books.reduce(
                          (s, x) => s + x.quantity_available,
                          0,
                        )}
                      </td>
                      <td className={td}>{b.applications[0]?.count ?? 0}</td>
                      <td className={td}>
                        {b.closes_at ? formatDate(b.closes_at) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No batches yet"
          text="Create a batch, list its books and copies, then open it for applications."
          action={{ label: "Create a batch", href: "/admin/batches/new" }}
        />
      )}
    </div>
  );
}
