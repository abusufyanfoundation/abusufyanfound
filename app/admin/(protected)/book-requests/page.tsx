import { revalidatePath } from "next/cache";
import {
  EmptyState,
  PageHeader,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { logAudit } from "@/lib/admin/audit";
import { titleCase } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Book requests",
  robots: { index: false, follow: false },
};

const STATUSES = ["pending", "approved", "rejected", "fulfilled"] as const;

type Request = {
  id: string;
  reference: string;
  created_at: string;
  status: string;
  requester_type: string;
  requester_name: string;
  organisation_name: string | null;
  email: string | null;
  phone: string;
  city: string;
  state: string;
  address: string;
  book_title: string;
  book_author: string | null;
  quantity: number;
  reason: string | null;
  admin_notes: string | null;
};

async function updateRequest(formData: FormData) {
  "use server";

  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id || !(STATUSES as readonly string[]).includes(status)) return;

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("book_requests")
    .select(
      "reference, status, requester_type, requester_name, organisation_name, city, state",
    )
    .eq("id", id)
    .maybeSingle<{
      reference: string;
      status: string;
      requester_type: string;
      requester_name: string;
      organisation_name: string | null;
      city: string;
      state: string;
    }>();

  if (!before) return;

  const { error } = await supabase
    .from("book_requests")
    .update({
      status,
      admin_notes: notes || null,
      ...(before.status === "pending"
        ? { reviewed_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", id);

  if (error) {
    console.error("updateRequest:", error.message);
    return;
  }

  // A fulfilled request means this person or mosque has been served
  if (status === "fulfilled" && before.status !== "fulfilled") {
    const { error: beneficiaryError } = await supabase
      .from("beneficiaries")
      .insert({
        name: before.organisation_name ?? before.requester_name,
        type: before.requester_type,
        location: `${before.city}, ${before.state}`,
        book_request_id: id,
      });

    // 23505 means the beneficiary already exists for this request, which is fine
    if (beneficiaryError && beneficiaryError.code !== "23505") {
      console.error("updateRequest beneficiary:", beneficiaryError.message);
    }
  }

  if (before.status !== status) {
    await logAudit(supabase, actor, {
      action: "book_request.status_updated",
      entity: "book_request",
      entityId: id,
      summary: `Changed book request ${before.reference} to ${titleCase(status)}`,
      details: { from: before.status, to: status },
    });
  }

  revalidatePath("/admin/book-requests");
  revalidatePath("/admin/beneficiaries");
  revalidatePath("/admin/activity");
}

export default async function BookRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "")
    ? sp.status
    : undefined;

  const supabase = await createClient();

  let query = supabase
    .from("book_requests")
    .select(
      "id, reference, created_at, status, requester_type, requester_name, organisation_name, email, phone, city, state, address, book_title, book_author, quantity, reason, admin_notes",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);

  const { data, error } = await query.returns<Request[]>();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Book requests"
        intro="Requests for books that are not in any batch. Approve the ones you can supply, and mark them fulfilled once the books have been handed over."
      />

      <form className="flex flex-wrap items-end gap-3">
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
      </form>

      {error ? (
        <p
          role="alert"
          className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Book requests could not be loaded.
        </p>
      ) : data?.length ? (
        <TableWrap>
          <thead className="border-b border-rule bg-paper">
            <tr>
              <th className={th}>Requester</th>
              <th className={th}>Book</th>
              <th className={th}>Status</th>
              <th className={th}>Review</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {data.map((r) => (
              <tr key={r.id}>
                <td className={td}>
                  <div className="font-medium">
                    {r.organisation_name ?? r.requester_name}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {titleCase(r.requester_type)} · {r.requester_name}
                  </div>
                  <div className="text-xs text-muted">
                    {r.phone}
                    {r.email ? ` · ${r.email}` : ""}
                  </div>
                  <div className="text-xs text-muted">
                    {r.address}, {r.city}, {r.state}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {r.reference} · {formatDate(r.created_at)}
                  </div>
                </td>

                <td className={td}>
                  <div className="font-medium">
                    {r.quantity} × {r.book_title}
                  </div>
                  {r.book_author && (
                    <div className="text-xs text-muted">{r.book_author}</div>
                  )}
                  {r.reason && (
                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted">
                      {r.reason}
                    </p>
                  )}
                </td>
                <td className={td}>
                  <div className="mt-2">
                    <p className="text-sm">{titleCase(r.status)}</p>
                  </div>
                </td>
                <td className={td}>
                  <form action={updateRequest} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={r.id} />

                    <select
                      name="status"
                      defaultValue={r.status}
                      className="border border-rule bg-white px-2 py-2 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {titleCase(s)}
                        </option>
                      ))}
                    </select>

                    <input
                      name="notes"
                      placeholder="Notes (visible to admins only)"
                      defaultValue={r.admin_notes ?? ""}
                      className="border border-rule px-2 py-2 text-sm"
                    />
                  </form>
                </td>

                <td className={td}>
                  <button
                    type="submit"
                    className="w-fit text-sm text-white bg-gold-deep py-2 px-3 underline-offset-4 hover:bg-gold-deep/90"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      ) : (
        <EmptyState
          title="No book requests yet"
          text="Requests for books outside the current batches will appear here."
        />
      )}
    </div>
  );
}
