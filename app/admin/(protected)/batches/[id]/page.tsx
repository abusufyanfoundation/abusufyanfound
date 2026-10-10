import Link from "next/link";
import { notFound } from "next/navigation";
import { BatchBookForm } from "@/components/admin/BatchBookForm";
import { BatchForm } from "@/components/admin/BatchForm";
import { BatchLocationForm } from "@/components/admin/BatchLocationForm";
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
import { toInputDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  deleteBatchBook,
  deleteBatchLocation,
  setBatchStatus,
  updateBatchBook,
} from "../actions";

export const metadata = {
  title: "Batch",
  robots: { index: false, follow: false },
};

type Batch = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  max_copies_per_applicant: number;
  opens_at: string | null;
  closes_at: string | null;
  campaign: { title: string; completed_at: string | null } | null;
};

type Book = {
  id: string;
  title: string;
  author: string | null;
  quantity_available: number;
};

type Location = {
  id: string;
  name: string;
  address: string;
};

type Item = {
  batch_book_id: string;
  quantity_requested: number;
  quantity_approved: number;
  applications: { status: string; batch_id: string } | null;
};

const outline =
  "border border-navy px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";

const TRANSITIONS: Record<string, { status: string; label: string }[]> = {
  draft: [{ status: "open", label: "Open applications" }],
  open: [
    { status: "closed", label: "Close applications" },
    { status: "fulfilled", label: "Mark as fulfilled" },
  ],
  closed: [
    { status: "open", label: "Reopen applications" },
    { status: "fulfilled", label: "Mark as fulfilled" },
  ],
  fulfilled: [],
};

const STATUS_NOTE: Record<string, string> = {
  draft:
    "Applicants cannot see this batch yet. Add its books, then open it once the campaign is completed.",
  open: "Applicants can see this batch and apply for copies.",
  closed:
    "Applications are closed. You can still review the ones already received.",
  fulfilled: "All approved copies in this batch have been handed out.",
};

export default async function BatchPage({
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

  const [batchRes, booksRes, itemsRes, locationsRes] = await Promise.all([
    supabase
      .from("batches")
      .select(
        "id, title, description, status, max_copies_per_applicant, opens_at, closes_at, campaign:campaigns(title, completed_at)",
      )
      .eq("id", id)
      .maybeSingle<Batch>(),
    supabase
      .from("batch_books")
      .select("id, title, author, quantity_available")
      .eq("batch_id", id)
      .order("created_at")
      .returns<Book[]>(),
    supabase
      .from("application_items")
      .select(
        "batch_book_id, quantity_requested, quantity_approved, applications!inner(status, batch_id)",
      )
      .eq("applications.batch_id", id)
      .returns<Item[]>(),
    supabase
      .from("batch_locations")
      .select("id, name, address")
      .eq("batch_id", id)
      .order("created_at")
      .returns<Location[]>(),
  ]);

  const batch = batchRes.data;
  if (!batch) notFound();

  const books = booksRes.data ?? [];
  const locations = locationsRes.data ?? [];

  const stats = new Map<string, { allocated: number; pending: number }>();
  for (const item of itemsRes.data ?? []) {
    const s = stats.get(item.batch_book_id) ?? { allocated: 0, pending: 0 };
    const status = item.applications?.status;
    if (status === "pending") s.pending += item.quantity_requested;
    if (status === "approved" || status === "fulfilled") {
      s.allocated += item.quantity_approved;
    }
    stats.set(item.batch_book_id, s);
  }

  const totalCopies = books.reduce((s, b) => s + b.quantity_available, 0);
  const totalAllocated = [...stats.values()].reduce(
    (s, v) => s + v.allocated,
    0,
  );
  const campaignCompleted = Boolean(batch.campaign?.completed_at);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{ label: "Back to batches", href: "/admin/batches" }}
        title={batch.title}
      />

      {error && <FormMessage error={error} />}
      {notice && <FormMessage message={notice} />}

      <Panel title="Status">
        <p className="text-sm text-ink">
          This batch is <StatusText status={titleCase(batch.status)} />.
        </p>
        <p className="mt-2 text-sm text-muted">{STATUS_NOTE[batch.status]}</p>

        {batch.status === "draft" && !campaignCompleted && (
          <p className="mt-2 text-sm text-muted">
            The campaign &ldquo;{batch.campaign?.title}&rdquo; is not completed
            yet, so this batch cannot be opened.
          </p>
        )}

        <p className="mt-4 text-sm text-muted">
          {totalCopies} copies in this batch · {totalAllocated} allocated to
          applicants ·{" "}
          <Link
            href={`/admin/applications?batch=${batch.id}`}
            className="text-navy underline decoration-gold underline-offset-4"
          >
            View applications
          </Link>
        </p>

        {TRANSITIONS[batch.status]?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-4">
            {TRANSITIONS[batch.status].map((t) => (
              <form key={t.status} action={setBatchStatus}>
                <input type="hidden" name="id" value={batch.id} />
                <input type="hidden" name="status" value={t.status} />
                <button type="submit" className={outline}>
                  {t.label}
                </button>
              </form>
            ))}
          </div>
        )}
      </Panel>

      <section>
        <h2 className="mb-5 font-display text-xl text-navy">
          Books in this batch
        </h2>

        {books.length > 0 ? (
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>Book</th>
                <th className={th}>Copies in batch</th>
                <th className={th}>Allocated</th>
                <th className={th}>Awaiting review</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {books.map((book) => {
                const s = stats.get(book.id) ?? { allocated: 0, pending: 0 };
                return (
                  <tr key={book.id}>
                    <td className={td}>
                      <div className="font-medium">{book.title}</div>
                      {book.author && (
                        <div className="text-xs text-muted">{book.author}</div>
                      )}
                    </td>
                    <td className={td}>
                      {/* <form
                        action={updateBatchBook}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="id" value={book.id} />
                        <input type="hidden" name="batchId" value={batch.id} />
                        <input
                          type="number"
                          name="copies"
                          min={0}
                          step={1}
                          defaultValue={book.quantity_available}
                          className="w-24 border border-rule px-2 py-2 text-sm"
                        />
                        <button
                          type="submit"
                          className="text-sm text-navy underline decoration-gold underline-offset-4"
                        >
                          Save
                        </button>
                      </form> */}

                      {book.quantity_available}
                    </td>
                    <td className={td}>{s.allocated}</td>
                    <td className={td}>{s.pending}</td>
                    <td className={td}>
                      <form action={deleteBatchBook}>
                        <input type="hidden" name="id" value={book.id} />
                        <input type="hidden" name="batchId" value={batch.id} />
                        <button
                          type="submit"
                          className="text-sm text-muted underline underline-offset-4 hover:text-navy"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        ) : (
          <p className="text-sm text-muted">
            No books yet. Add the first one below.
          </p>
        )}
      </section>

      {batch.status !== "fulfilled" && (
        <section>
          <h2 className="mb-5 font-display text-xl text-navy">Add a book</h2>
          <BatchBookForm batchId={batch.id} />
        </section>
      )}

      <section>
        <h2 className="mb-2 font-display text-xl text-navy">
          Pickup locations
        </h2>
        <p className="mb-5 max-w-2xl text-sm text-muted">
          Applicants see these while applying. Students must choose one to
          collect their books from. Mosques and schools can choose one too, or
          ask for delivery to their own address.
        </p>

        {locations.length > 0 ? (
          <ul className="mb-8 max-w-2xl divide-y divide-rule border-y border-rule">
            {locations.map((l) => (
              <li
                key={l.id}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{l.name}</p>
                  <p className="text-sm text-muted">{l.address}</p>
                </div>
                <form action={deleteBatchLocation}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="batchId" value={batch.id} />
                  <button
                    type="submit"
                    className="text-sm text-muted underline underline-offset-4 hover:text-navy"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-8 text-sm text-muted">
            No locations yet. Add at least one before opening this batch.
          </p>
        )}

        {batch.status !== "fulfilled" && (
          <BatchLocationForm batchId={batch.id} />
        )}
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl text-navy">Details</h2>
        <BatchForm
          batch={{
            id: batch.id,
            campaignTitle: batch.campaign?.title ?? "—",
            title: batch.title,
            description: batch.description,
            maxCopies: batch.max_copies_per_applicant,
            opensOn: batch.opens_at ? toInputDate(batch.opens_at) : "",
            closesOn: batch.closes_at ? toInputDate(batch.closes_at) : "",
          }}
        />
      </section>
    </div>
  );
}
