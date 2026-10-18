import Link from "next/link";
import {
  EmptyState,
  PageHeader,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { titleCase } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Batches",
  robots: { index: false, follow: false },
};

type Row = {
  id: string;
  batch_number: number;
  title: string;
  status: string;
  closes_at: string | null;
  campaign: { id: string; title: string } | null;
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
      "id, batch_number, title, status, closes_at, campaign:campaigns(id, title), batch_books(quantity_available), applications(count)",
    );
  if (campaignId) query = query.eq("campaign_id", campaignId);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Batches"
        intro="A batch is the list of books bought with a campaign's funds. Students, mosques and schools apply for copies from an open batch."
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
      ) : data?.length ? (
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
            {data.map((b) => (
              <tr key={b.id}>
                <td className={td}>
                  <Link
                    href={`/admin/batches/${b.id}`}
                    className="font-medium text-navy underline decoration-gold underline-offset-4"
                  >
                    {b.title}
                  </Link>
                  <div className="mt-1 text-xs text-muted">
                    Batch {b.batch_number} ·{" "}
                    {b.campaign ? (
                      <Link
                        href={`/admin/campaigns/${b.campaign.id}`}
                        className="underline underline-offset-4 hover:text-navy"
                      >
                        {b.campaign.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </div>
                </td>
                <td className={td}>
                  <StatusText status={titleCase(b.status)} />
                </td>
                <td className={td}>
                  {b.batch_books.reduce((s, x) => s + x.quantity_available, 0)}
                </td>
                <td className={td}>{b.applications[0]?.count ?? 0}</td>
                <td className={td}>
                  {b.closes_at ? formatDate(b.closes_at) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
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
