import { notFound } from "next/navigation";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import {
  PageHeader,
  Panel,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { titleCase } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { reviewApplication } from "../actions";

export const metadata = {
  title: "Application",
  robots: { index: false, follow: false },
};

type Application = {
  id: string;
  reference: string;
  status: string;
  applicant_type: string;
  applicant_name: string;
  organisation_name: string | null;
  email: string | null;
  phone: string;
  state: string;
  city: string;
  address: string;
  verifier_name: string | null;
  verifier_phone: string | null;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  fulfilled_at: string | null;
  batch: { id: string; title: string } | null;
  application_items: {
    id: string;
    quantity_requested: number;
    quantity_approved: number;
    batch_book: { title: string } | null;
  }[];
};

const primary =
  "bg-navy px-5 py-2 text-sm font-medium text-white hover:bg-navy-deep";
const outline =
  "border border-navy px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

export default async function ApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error, notice } = await searchParams;

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();

  const { data: app } = await supabase
    .from("applications")
    .select(
      `id, reference, status, applicant_type, applicant_name, organisation_name, email, phone,
       state, city, address, verifier_name, verifier_phone, admin_notes,
       created_at, reviewed_at, fulfilled_at,
       batch:batches(id, title),
       application_items(id, quantity_requested, quantity_approved, batch_book:batch_books(title))`,
    )
    .eq("id", id)
    .maybeSingle<Application>();

  if (!app) notFound();

  const reviewable = app.status === "pending" || app.status === "approved";

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{ label: "Back to applications", href: "/admin/applications" }}
        title={app.organisation_name ?? app.applicant_name}
        intro={`${app.reference} · ${titleCase(app.applicant_type)} · applied ${formatDateTime(app.created_at)}`}
      />

      {error && <FormMessage error={error} />}
      {notice && <FormMessage message={notice} />}

      <Panel title="Applicant">
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Detail label="Contact person" value={app.applicant_name} />
          <Detail label="Organisation" value={app.organisation_name} />
          <Detail label="Phone" value={app.phone} />
          <Detail label="Email" value={app.email} />
          <Detail
            label="Address"
            value={`${app.address}, ${app.city}, ${app.state}`}
          />
          <Detail label="Batch" value={app.batch?.title ?? null} />
          <Detail label="Reference person" value={app.verifier_name} />
          <Detail label="Reference phone" value={app.verifier_phone} />
        </dl>
      </Panel>

      <Panel title="Review">
        <p className="mb-5 text-sm text-ink">
          Status: <StatusText status={titleCase(app.status)} />
          {app.reviewed_at && (
            <span className="text-muted">
              {" "}
              · reviewed {formatDateTime(app.reviewed_at)}
            </span>
          )}
          {app.fulfilled_at && (
            <span className="text-muted">
              {" "}
              · fulfilled {formatDateTime(app.fulfilled_at)}
            </span>
          )}
        </p>

        <form action={reviewApplication} className="flex flex-col gap-6">
          <input type="hidden" name="id" value={app.id} />

          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>Book</th>
                <th className={th}>Requested</th>
                <th className={th}>{reviewable ? "Approve" : "Approved"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {app.application_items.map((item) => (
                <tr key={item.id}>
                  <td className={td}>{item.batch_book?.title ?? "Book"}</td>
                  <td className={td}>{item.quantity_requested}</td>
                  <td className={td}>
                    {reviewable ? (
                      <input
                        type="number"
                        name={`approved_${item.id}`}
                        min={0}
                        max={item.quantity_requested}
                        step={1}
                        defaultValue={
                          item.quantity_approved > 0
                            ? item.quantity_approved
                            : item.quantity_requested
                        }
                        className="w-24 border border-rule px-2 py-2 text-sm"
                      />
                    ) : (
                      item.quantity_approved
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          {reviewable ? (
            <>
              <label className="text-sm text-muted">
                Notes (only admins see these)
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={app.admin_notes ?? ""}
                  className="mt-1 w-full border border-rule px-3 py-2 text-sm text-ink"
                />
              </label>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  name="intent"
                  value="approve"
                  className={primary}
                >
                  {app.status === "approved"
                    ? "Save approved copies"
                    : "Approve"}
                </button>

                {app.status === "approved" && (
                  <button
                    type="submit"
                    name="intent"
                    value="fulfil"
                    className={outline}
                  >
                    Mark as fulfilled
                  </button>
                )}

                <button
                  type="submit"
                  name="intent"
                  value="reject"
                  className={outline}
                >
                  Reject
                </button>
              </div>

              <p className="max-w-xl text-xs leading-relaxed text-muted">
                Approving sets aside those copies for this applicant. Rejecting
                frees them again. Marking as fulfilled adds the applicant to
                Beneficiaries and records the distribution against the campaign.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Notes: {app.admin_notes || "none"}
            </p>
          )}
        </form>
      </Panel>
    </div>
  );
}
