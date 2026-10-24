import Link from "next/link";
import { notFound } from "next/navigation";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { PageHeader, Panel, StatusText } from "@/components/admin/ui";
import { consentText } from "@/lib/admin/consent";
import { bookStatusLabel, titleCase } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import {
  addRequestToBatch,
  addRequestToBooks,
  reviewBookRequest,
} from "../actions";

export const metadata = {
  title: "Book request",
  robots: { index: false, follow: false },
};

type BookRequest = {
  id: string;
  reference: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  requester_type: string;
  requester_name: string;
  organisation_name: string | null;
  email: string | null;
  phone: string;
  state: string;
  city: string;
  address: string;
  book_title: string;
  book_author: string | null;
  quantity: number;
  reason: string | null;
  admin_notes: string | null;
  consent_at: string | null;
  consent_version: string | null;
  book_id: string | null;
  batch_book_id: string | null;
  book: { id: string; title: string; status: string } | null;
  batch_book: {
    id: string;
    title: string;
    batch: { id: string; batch_number: number; title: string } | null;
  } | null;
};

type DraftBatch = {
  id: string;
  batch_number: number;
  title: string;
  campaign: { title: string } | null;
};

const primary =
  "bg-navy px-5 py-2 text-sm font-medium text-white hover:bg-navy-deep";
const outline =
  "border border-navy px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";
const field =
  "mt-1 w-full border border-rule bg-white px-3 py-2 text-sm text-ink";
const link = "text-navy underline decoration-gold underline-offset-4";

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

export default async function BookRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error, notice } = await searchParams;

  if (!isUuid(id)) notFound();

  const supabase = await createClient();

  const { data: r } = await supabase
    .from("book_requests")
    .select(
      `id, reference, status, created_at, reviewed_at, requester_type, requester_name,
       organisation_name, email, phone, state, city, address, book_title, book_author,
       quantity, reason, admin_notes, consent_at, consent_version, book_id, batch_book_id,
       book:books(id, title, status),
       batch_book:batch_books(id, title, batch:batches(id, batch_number, title))`,
    )
    .eq("id", id)
    .maybeSingle<BookRequest>();

  if (!r) notFound();

  const open = r.status === "pending" || r.status === "approved";
  const linked = Boolean(r.book || r.batch_book);
  const canSupply = r.status === "approved" && !linked;

  // Only batches still in draft can take another book
  let draftBatches: DraftBatch[] = [];
  if (canSupply) {
    const { data } = await supabase
      .from("batches")
      .select("id, batch_number, title, campaign:campaigns(title)")
      .eq("status", "draft")
      .order("batch_number")
      .returns<DraftBatch[]>();
    draftBatches = data ?? [];
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{ label: "Back to book requests", href: "/admin/book-requests" }}
        title={r.organisation_name ?? r.requester_name}
        intro={`${r.reference} · ${titleCase(r.requester_type)} · requested ${formatDateTime(r.created_at)}`}
      />

      {error && <FormMessage error={error} />}
      {notice && <FormMessage message={notice} />}

      <Panel title="Requester">
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Detail label="Contact person" value={r.requester_name} />
          <Detail label="Organisation" value={r.organisation_name} />
          <Detail label="Phone" value={r.phone} />
          <Detail label="Email" value={r.email} />
          <Detail
            label="Address"
            value={`${r.address}, ${r.city}, ${r.state}`}
          />
          <Detail
            label="Privacy consent"
            value={consentText(r.consent_at, r.consent_version)}
          />
        </dl>
      </Panel>

      <Panel title="The book">
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Detail label="Title" value={r.book_title} />
          <Detail label="Author" value={r.book_author} />
          <Detail label="Copies" value={String(r.quantity)} />
        </dl>

        <div className="mt-6 flex flex-col gap-2 rounded border border-rule bg-paper p-4">
          <p className="font-medium text-gold-deep">Why they need it</p>
          <p className="text-sm text-ink">{r.reason || "—"}</p>
        </div>
      </Panel>

      <Panel title="Review">
        <p className="mb-5 text-sm text-ink">
          Status: <StatusText status={titleCase(r.status)} />
          {r.reviewed_at && (
            <span className="text-muted">
              {" "}
              · reviewed {formatDateTime(r.reviewed_at)}
            </span>
          )}
        </p>

        {open ? (
          <form action={reviewBookRequest} className="flex flex-col gap-6">
            <input type="hidden" name="id" value={r.id} />

            <label className="text-sm text-muted">
              Notes (only admins see these)
              <textarea
                name="notes"
                rows={3}
                maxLength={1000}
                defaultValue={r.admin_notes ?? ""}
                className="mt-1 w-full border border-rule px-3 py-2 text-sm text-ink"
              />
            </label>

            <div className="flex flex-wrap gap-4">
              {r.status === "pending" && (
                <button
                  type="submit"
                  name="intent"
                  value="approve"
                  className={primary}
                >
                  Approve
                </button>
              )}

              {r.status === "approved" && (
                <button
                  type="submit"
                  name="intent"
                  value="fulfil"
                  className={primary}
                >
                  Mark as fulfilled
                </button>
              )}

              <button
                type="submit"
                name="intent"
                value="notes"
                className={outline}
              >
                Save notes
              </button>

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
              Approving adds the request to your list. It does not mean the book
              is bought yet. Mark it as fulfilled once the books have been
              handed over; that adds the requester to Beneficiaries. The
              requester is emailed when you approve, reject or fulfil.
            </p>
          </form>
        ) : (
          <p className="text-sm text-muted">Notes: {r.admin_notes || "none"}</p>
        )}
      </Panel>

      {(canSupply || linked) && (
        <Panel title="Supply this book">
          {r.book && (
            <p className="text-sm text-ink">
              Added to the pre-fund list as “{r.book.title}” (
              {bookStatusLabel(r.book.status)}).{" "}
              <Link href={`/admin/books/${r.book.id}`} className={link}>
                Open the book
              </Link>
            </p>
          )}

          {r.batch_book && (
            <p className="text-sm text-ink">
              Added to{" "}
              {r.batch_book.batch
                ? `Batch ${r.batch_book.batch.batch_number}`
                : "a batch"}{" "}
              as “{r.batch_book.title}”.{" "}
              {r.batch_book.batch && (
                <Link
                  href={`/admin/batches/${r.batch_book.batch.id}`}
                  className={link}
                >
                  Open the batch
                </Link>
              )}
            </p>
          )}

          {canSupply && (
            <>
              <p className="mb-6 max-w-xl text-sm text-muted">
                Once you decide to supply this book, add it to one of the lists
                below. You can change the title and author first. A request can
                be added only once.
              </p>

              <div className="grid gap-6 lg:grid-cols-2">
                <form
                  action={addRequestToBooks}
                  className="flex flex-col gap-4 border border-rule p-5"
                >
                  <input type="hidden" name="id" value={r.id} />
                  <h3 className="font-medium text-navy">
                    Add to the pre-fund list
                  </h3>
                  <p className="text-xs leading-relaxed text-muted">
                    Donors can then pay for copies of this book. It is added as
                    a draft, so nothing shows on the website until you list it.
                  </p>

                  <label className="text-sm text-muted">
                    Title
                    <input
                      required
                      name="bookTitle"
                      defaultValue={r.book_title}
                      maxLength={200}
                      className={field}
                    />
                  </label>

                  <label className="text-sm text-muted">
                    Author
                    <input
                      required
                      name="bookAuthor"
                      defaultValue={r.book_author ?? ""}
                      maxLength={200}
                      className={field}
                    />
                  </label>

                  <label className="text-sm text-muted">
                    Price per copy (₦)
                    <input
                      required
                      name="priceNaira"
                      type="number"
                      min={1}
                      step="any"
                      className={field}
                    />
                  </label>

                  <button type="submit" className={`${outline} w-fit`}>
                    Add to the pre-fund list
                  </button>
                </form>

                {draftBatches.length > 0 ? (
                  <form
                    action={addRequestToBatch}
                    className="flex flex-col gap-4 border border-rule p-5"
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <h3 className="font-medium text-navy">Add to a batch</h3>
                    <p className="text-xs leading-relaxed text-muted">
                      Only batches still in draft are listed.
                    </p>

                    <label className="text-sm text-muted">
                      Batch
                      <select required name="batchId" className={field}>
                        {draftBatches.map((batch) => (
                          <option key={batch.id} value={batch.id}>
                            Batch {batch.batch_number} · {batch.title}
                            {batch.campaign ? ` (${batch.campaign.title})` : ""}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-muted">
                      Title
                      <input
                        required
                        name="bookTitle"
                        defaultValue={r.book_title}
                        maxLength={200}
                        className={field}
                      />
                    </label>

                    <label className="text-sm text-muted">
                      Author (optional)
                      <input
                        name="bookAuthor"
                        defaultValue={r.book_author ?? ""}
                        maxLength={200}
                        className={field}
                      />
                    </label>

                    <label className="text-sm text-muted">
                      Copies
                      <input
                        required
                        name="copies"
                        type="number"
                        min={1}
                        step={1}
                        defaultValue={r.quantity}
                        className={field}
                      />
                    </label>

                    <button type="submit" className={`${outline} w-fit`}>
                      Add to the batch
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-2 border border-rule p-5">
                    <h3 className="font-medium text-navy">Add to a batch</h3>
                    <p className="text-sm text-muted">
                      There is no batch in draft right now. Create one in{" "}
                      <Link href="/admin/batches" className={link}>
                        Batches
                      </Link>{" "}
                      first.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </Panel>
      )}
    </div>
  );
}
