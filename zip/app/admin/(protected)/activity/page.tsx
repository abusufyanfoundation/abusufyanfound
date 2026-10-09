import {
  AdminPagination,
  EmptyState,
  PageHeader,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import type { Change } from "@/lib/admin/diff";
import { cleanSearch, parsePage } from "@/lib/admin/filters";
import { ENTITY_LABELS } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Activity log",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 30;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

type Entry = {
  id: string;
  created_at: string;
  actor_name: string | null;
  actor_email: string | null;
  summary: string;
  entity: string;
  details: { changes?: Change[] } | null;
};

// Lagos has no daylight saving, so it is always UTC+1
const startOfDay = (date: string) => `${date}T00:00:00+01:00`;
const dayAfter = (date: string) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{
    entity?: string;
    admin?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const entity = Object.keys(ENTITY_LABELS).find((e) => e === sp.entity);
  const admin = cleanSearch(sp.admin);
  const from = sp.from && DATE.test(sp.from) ? sp.from : undefined;
  const to = sp.to && DATE.test(sp.to) ? sp.to : undefined;
  const page = parsePage(sp.page);

  const supabase = await createClient();

  let query = supabase
    .from("audit_log")
    .select(
      "id, created_at, actor_name, actor_email, summary, entity, details",
      {
        count: "exact",
      },
    );
  if (entity) query = query.eq("entity", entity);
  if (admin) query = query.eq("actor_email", admin);
  if (from) query = query.gte("created_at", startOfDay(from));
  if (to) query = query.lt("created_at", startOfDay(dayAfter(to)));

  const offset = (page - 1) * PAGE_SIZE;
  const [{ data, count }, actorsRes] = await Promise.all([
    query
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)
      .returns<Entry[]>(),
    supabase
      .from("audit_log")
      .select("actor_email, actor_name")
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<{ actor_email: string | null; actor_name: string | null }[]>(),
  ]);

  const actors = new Map<string, string>();
  for (const a of actorsRes.data ?? []) {
    if (a.actor_email && !actors.has(a.actor_email)) {
      actors.set(a.actor_email, a.actor_name ?? a.actor_email);
    }
  }

  const rows = data ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const filtered = Boolean(entity || admin || from || to);

  const field =
    "border border-rule bg-white px-3.5 py-2.5 text-sm text-ink focus:border-navy";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Activity log"
        intro="A record of what administrators do on the site. Entries cannot be edited or deleted."
      />

      <form
        action="/admin/activity"
        className="flex flex-col gap-3 lg:flex-row lg:items-end"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="entity" className="text-xs text-muted">
            Area
          </label>
          <select
            id="entity"
            name="entity"
            defaultValue={entity ?? ""}
            className={field}
          >
            <option value="">All areas</option>
            {Object.entries(ENTITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="admin" className="text-xs text-muted">
            Administrator
          </label>
          <select
            id="admin"
            name="admin"
            defaultValue={admin ?? ""}
            className={field}
          >
            <option value="">All administrators</option>
            {[...actors].map(([email, name]) => (
              <option key={email} value={email}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-xs text-muted">
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from}
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-xs text-muted">
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to}
            className={field}
          />
        </div>

        <button
          type="submit"
          className="rounded-sm bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-deep"
        >
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={filtered ? "Nothing matches" : "No activity yet"}
          text={
            filtered
              ? "Try different filters or clear them to see everything."
              : "What administrators do will be recorded here."
          }
          action={
            filtered
              ? { label: "Clear filters", href: "/admin/activity" }
              : undefined
          }
        />
      ) : (
        <>
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>When</th>
                <th className={th}>Administrator</th>
                <th className={th}>What happened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {rows.map((e) => (
                <tr key={e.id}>
                  <td className={`${td} whitespace-nowrap`}>
                    {formatDateTime(e.created_at)}
                  </td>
                  <td className={td}>
                    {e.actor_name ?? e.actor_email ?? "Unknown"}
                    {e.actor_name && e.actor_email && (
                      <span className="block text-xs text-muted">
                        {e.actor_email}
                      </span>
                    )}
                  </td>
                  <td className={td}>
                    <span className="text-xs uppercase tracking-wider text-gold-deep">
                      {ENTITY_LABELS[e.entity] ?? e.entity}
                    </span>
                    <span className="block">{e.summary}</span>
                    {e.details?.changes && e.details.changes.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-navy underline decoration-gold underline-offset-4">
                          See what changed
                        </summary>
                        <ul className="mt-2 flex flex-col gap-1 text-xs text-muted">
                          {e.details.changes.map((c) => (
                            <li key={c.field}>
                              <span className="font-medium text-ink">
                                {c.field}:
                              </span>{" "}
                              {c.from || "empty"} → {c.to || "empty"}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <AdminPagination
            basePath="/admin/activity"
            params={{ entity, admin, from, to }}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
