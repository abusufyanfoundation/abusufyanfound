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
import { titleCase } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Applications",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 25;
const STATUSES = ["pending", "approved", "rejected", "fulfilled"];
const UUID = /^[0-9a-f-]{36}$/i;

type Row = {
  id: string;
  reference: string;
  applicant_name: string;
  organisation_name: string | null;
  applicant_type: string;
  status: string;
  created_at: string;
  city: string;
  state: string;
  batch: { title: string } | null;
  application_items: {
    quantity_requested: number;
    quantity_approved: number;
  }[];
};

const select = "border border-rule bg-white px-3 py-2 text-sm text-ink";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; batch?: string; page?: string }>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const status = STATUSES.includes(sp.status ?? "") ? sp.status : undefined;
  const batch = sp.batch && UUID.test(sp.batch) ? sp.batch : undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(
      "id, reference, applicant_name, organisation_name, applicant_type, status, created_at, city, state, batch:batches(title), application_items(quantity_requested, quantity_approved)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status) query = query.eq("status", status);
  if (batch) query = query.eq("batch_id", batch);

  const [list, batches] = await Promise.all([
    query.returns<Row[]>(),
    supabase
      .from("batches")
      .select("id, title")
      .order("created_at", { ascending: false })
      .returns<{ id: string; title: string }[]>(),
  ]);

  const rows = list.data ?? [];
  const totalPages = Math.max(1, Math.ceil((list.count ?? 0) / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Applications"
        intro="Review what students, mosques and schools have applied for, approve the copies they receive, and mark them fulfilled once handed over."
      />

      <form className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-muted">
          Status
          <select
            name="status"
            defaultValue={status ?? ""}
            className={`${select} mt-1 block`}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-muted">
          Batch
          <select
            name="batch"
            defaultValue={batch ?? ""}
            className={`${select} mt-1 block`}
          >
            <option value="">All batches</option>
            {(batches.data ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
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
      </form>

      {list.error ? (
        <p
          role="alert"
          className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Applications could not be loaded.
        </p>
      ) : rows.length ? (
        <>
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>Applicant</th>
                <th className={th}>Batch</th>
                <th className={th}>Copies</th>
                <th className={th}>Status</th>
                <th className={th}>Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {rows.map((a) => {
                const requested = a.application_items.reduce(
                  (s, i) => s + i.quantity_requested,
                  0,
                );
                const approved = a.application_items.reduce(
                  (s, i) => s + i.quantity_approved,
                  0,
                );
                return (
                  <tr key={a.id}>
                    <td className={td}>
                      <Link
                        href={`/admin/applications/${a.id}`}
                        className="font-medium text-navy underline decoration-gold underline-offset-4"
                      >
                        {a.organisation_name ?? a.applicant_name}
                      </Link>
                      <div className="mt-1 text-xs text-muted">
                        {titleCase(a.applicant_type)} · {a.city}, {a.state} ·{" "}
                        {a.reference}
                      </div>
                    </td>
                    <td className={td}>{a.batch?.title ?? "—"}</td>
                    <td className={td}>
                      {requested} requested
                      {approved > 0 && (
                        <div className="text-xs text-muted">
                          {approved} approved
                        </div>
                      )}
                    </td>
                    <td className={td}>
                      <StatusText status={titleCase(a.status)} />
                    </td>
                    <td className={td}>{formatDate(a.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>

          <AdminPagination
            basePath="/admin/applications"
            params={{ status, batch }}
            page={page}
            totalPages={totalPages}
          />
        </>
      ) : (
        <EmptyState
          title="No applications yet"
          text="Applications appear here once a batch is open and people start applying."
        />
      )}
    </div>
  );
}
