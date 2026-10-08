import Link from "next/link";
import {
  EmptyState,
  PageHeader,
  Panel,
  TableWrap,
  AdminPagination,
  StatusText,
  td,
  th,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/require-admin";
import { cleanSearch, parsePage } from "@/lib/admin/filters";
import { formatDateTime } from "@/lib/format";
import { formatNaira } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 25;

type Donation = {
  id: string;
  created_at: string;
  donor_name: string;
  donor_email: string | null;
  type: "general" | "book";
  amount_kobo: number;
  is_paid: boolean;
};

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const q = cleanSearch(typeof params.q === "string" ? params.q : undefined);

  const status = typeof params.status === "string" ? params.status : "all";

  const type = typeof params.type === "string" ? params.type : "all";

  const page = parsePage(
    typeof params.page === "string" ? params.page : undefined,
  );

  const supabase = await createClient();

  let query = supabase
    .from("donations")
    .select(
      "id, created_at, donor_name, donor_email, type, amount_kobo, is_paid",
      { count: "exact" },
    );

  if (q) {
    query = query.or(`donor_name.ilike.%${q}%,donor_email.ilike.%${q}%`);
  }

  if (status === "paid") {
    query = query.eq("is_paid", true);
  }

  if (status === "pending") {
    query = query.eq("is_paid", false);
  }

  if (type === "general" || type === "book") {
    query = query.eq("type", type);
  }

  const from = (page - 1) * PAGE_SIZE;

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
    .returns<Donation[]>();

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const exportParams = new URLSearchParams();

  if (q) {
    exportParams.set("q", q);
  }

  if (status !== "all") {
    exportParams.set("status", status);
  }

  if (type !== "all") {
    exportParams.set("type", type);
  }

  const exportHref = exportParams.toString()
    ? `/admin/donations/export?${exportParams.toString()}`
    : "/admin/donations/export";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Donations"
        intro="Review gifts received through the website."
        action={{
          label: "Export CSV",
          href: exportHref,
        }}
      />

      <Panel>
        <form
          method="GET"
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <label className="flex-1 text-sm text-muted">
            Search
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Name or email"
              className="mt-1 w-full border border-rule bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
            />
          </label>

          <label className="text-sm text-muted">
            Status
            <select
              name="status"
              defaultValue={status}
              className="mt-1 block border border-rule bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </label>

          <label className="text-sm text-muted">
            Type
            <select
              name="type"
              defaultValue={type}
              className="mt-1 block border border-rule bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="all">All</option>
              <option value="general">Campaign</option>
              <option value="book">Book pre-fund</option>
            </select>
          </label>

          <button
            type="submit"
            className="bg-navy px-5 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            Filter
          </button>
        </form>
      </Panel>

      {error ? (
        <p
          role="alert"
          className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Donations could not be loaded.
        </p>
      ) : data && data.length ? (
        <>
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
              {data.map((donation) => (
                <tr key={donation.id}>
                  <td className={td}>{formatDateTime(donation.created_at)}</td>

                  <td className={td}>
                    <p>{donation.donor_name}</p>

                    {donation.donor_email && (
                      <p className="mt-1 text-xs text-muted">
                        {donation.donor_email}
                      </p>
                    )}
                  </td>

                  <td className={td}>
                    {donation.type === "book" ? "Book pre-fund" : "Campaign"}
                  </td>

                  <td className={td}>{formatNaira(donation.amount_kobo)}</td>

                  <td className={td}>
                    <StatusText
                      status={donation.is_paid ? "Paid" : "Pending"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <AdminPagination
            basePath="/admin/donations"
            params={{
              q,
              status: status === "all" ? undefined : status,
              type: type === "all" ? undefined : type,
            }}
            page={page}
            totalPages={totalPages}
          />
        </>
      ) : (
        <EmptyState
          title="No donations found"
          text="Try a different search or filter."
        />
      )}

      {/* <Link
        href="/admin"
        className="text-sm text-navy underline decoration-gold underline-offset-4"
      >
        Back to overview
      </Link> */}
    </div>
  );
}
