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
import { cleanSearch, parsePage } from "@/lib/admin/filters";
import { BOOK_STATUSES, bookStatusLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatNaira } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Books",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

type BookRow = {
  id: string;
  title: string;
  author: string;
  price_kobo: number;
  status: string;
};

type Funding = { book_id: string; funded_qty: number; distributed_qty: number };

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const q = cleanSearch(sp.q);
  const status = BOOK_STATUSES.find((s) => s === sp.status);
  const page = parsePage(sp.page);

  const supabase = await createClient();

  let query = supabase
    .from("books")
    .select("id, title, author, price_kobo, status", { count: "exact" });
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query
    .order("title")
    .range(from, from + PAGE_SIZE - 1)
    .returns<BookRow[]>();

  const rows = data ?? [];
  const ids = rows.map((b) => b.id);

  const funding = ids.length
    ? ((
        await supabase
          .from("admin_book_funding")
          .select("book_id, funded_qty, distributed_qty")
          .in("book_id", ids)
          .returns<Funding[]>()
      ).data ?? [])
    : [];
  const fundingById = new Map(funding.map((f) => [f.book_id, f]));

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const filtered = Boolean(q || status);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Books"
        intro="The books supporters can pre-fund. Only Listed books appear on the website, and a book is bought only after a donor has paid for it."
        action={{ label: "Add a book", href: "/admin/books/new" }}
      />

      <form
        action="/admin/books"
        role="search"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="q" className="sr-only">
          Search by title or author
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by title or author"
          className="flex-1 border border-rule bg-white px-3.5 py-2.5 text-sm text-ink focus:border-navy"
        />
        <label htmlFor="status" className="sr-only">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status ?? ""}
          className="border border-rule bg-white px-3.5 py-2.5 text-sm text-ink focus:border-navy"
        >
          <option value="">All statuses</option>
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {bookStatusLabel(s)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-sm bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-deep"
        >
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={filtered ? "No books match" : "No books yet"}
          text={
            filtered
              ? "Try a different search or clear the filters."
              : "Add your first book so supporters can start pre-funding."
          }
          action={
            filtered
              ? { label: "Clear filters", href: "/admin/books" }
              : { label: "Add a book", href: "/admin/books/new" }
          }
        />
      ) : (
        <>
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>Book</th>
                <th className={th}>Status</th>
                <th className={th}>Price</th>
                <th className={th}>Copies funded</th>
                <th className={th}>Distributed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {rows.map((b) => {
                const f = fundingById.get(b.id);
                return (
                  <tr key={b.id}>
                    <td className={td}>
                      <Link
                        href={`/admin/books/${b.id}`}
                        className="font-medium text-navy underline decoration-gold underline-offset-4"
                      >
                        {b.title}
                      </Link>
                      <span className="block text-xs text-muted">
                        {b.author}
                      </span>
                    </td>
                    <td className={td}>
                      <StatusText status={bookStatusLabel(b.status)} />
                    </td>
                    <td className={td}>{formatNaira(b.price_kobo)}</td>
                    <td className={td}>{f?.funded_qty ?? 0}</td>
                    <td className={td}>{f?.distributed_qty ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>

          <AdminPagination
            basePath="/admin/books"
            params={{ q, status }}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
