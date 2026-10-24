import Link from "next/link";
import {
  AdminPagination,
  EmptyState,
  PageHeader,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { FilterForm } from "@/components/admin/FilterForm";
import { titleCase } from "@/lib/admin/labels";
import { pageFrom, pagesFor, rangeFor } from "@/lib/admin/pagination";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Book requests",
  robots: { index: false, follow: false },
};

const STATUSES = ["pending", "approved", "rejected", "fulfilled"] as const;

type Row = {
  id: string;
  reference: string;
  created_at: string;
  status: string;
  requester_type: string;
  requester_name: string;
  organisation_name: string | null;
  phone: string;
  city: string;
  state: string;
  book_title: string;
  book_author: string | null;
  quantity: number;
};

export default async function BookRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "")
    ? sp.status
    : undefined;
  const page = pageFrom(sp.page);
  const { from, to } = rangeFor(page);

  const supabase = await createClient();

  let query = supabase
    .from("book_requests")
    .select(
      "id, reference, created_at, status, requester_type, requester_name, organisation_name, phone, city, state, book_title, book_author, quantity",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query.returns<Row[]>();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Book requests"
        intro="Requests for books that are not in any batch. Open a request to approve it, reject it, or mark it fulfilled once the books have been handed over."
      />

      <FilterForm className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-muted">
          Status
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 block border border-rule bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="border border-navy px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white"
        >
          Filter
        </button>
      </FilterForm>

      {error ? (
        <p
          role="alert"
          className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Book requests could not be loaded.
        </p>
      ) : data?.length ? (
        <>
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>Requester</th>
                <th className={th}>Book</th>
                <th className={th}>Status</th>
                <th className={th}>Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {data.map((r) => (
                <tr key={r.id}>
                  <td className={td}>
                    <Link
                      href={`/admin/book-requests/${r.id}`}
                      className="font-medium text-navy underline decoration-gold underline-offset-4"
                    >
                      {r.organisation_name ?? r.requester_name}
                    </Link>
                    <div className="mt-1 text-xs text-muted">
                      {titleCase(r.requester_type)} · {r.city}, {r.state} ·{" "}
                      {r.reference}
                    </div>
                  </td>
                  <td className={td}>
                    <div className="font-medium">
                      {r.quantity} × {r.book_title}
                    </div>
                    {r.book_author && (
                      <div className="text-xs text-muted">{r.book_author}</div>
                    )}
                  </td>
                  <td className={td}>
                    <StatusText status={titleCase(r.status)} />
                  </td>
                  <td className={td}>{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <AdminPagination
            basePath="/admin/book-requests"
            params={{ status }}
            page={page}
            totalPages={pagesFor(count)}
          />
        </>
      ) : (
        <EmptyState
          title="No book requests yet"
          text="Requests for books outside the current batches will appear here."
        />
      )}
    </div>
  );
}
