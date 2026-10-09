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
  title: string;
  status: string;
  closes_at: string | null;
  campaign: { title: string } | null;
  batch_books: { quantity_available: number }[];
  applications: { count: number }[];
};

export default async function AdminBatchesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("batches")
    .select(
      "id, title, status, closes_at, campaign:campaigns(title), batch_books(quantity_available), applications(count)",
    )
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Batches"
        intro="A batch is the list of books bought with a campaign's funds. Students, mosques and schools apply for copies from an open batch."
        action={{ label: "New batch", href: "/admin/batches/new" }}
      />

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
              <th className={th}>Copies</th>
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
                    {b.campaign?.title ?? "—"}
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
