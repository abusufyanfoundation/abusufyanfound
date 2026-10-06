import { notFound } from "next/navigation";
import { BookForm } from "@/components/admin/BookForm";
import { StockForm } from "@/components/admin/StockForm";
import {
  PageHeader,
  Panel,
  Stat,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { stockReason } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Edit book",
  robots: { index: false, follow: false },
};

type Book = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  price_kobo: number;
  available_quantity: number;
  initial_quantity: number;
  status: string;
};

type Movement = {
  id: string;
  created_at: string;
  delta: number;
  reason: string;
  note: string | null;
};

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select(
      "id, title, author, description, cover_url, price_kobo, available_quantity, initial_quantity, status",
    )
    .eq("id", id)
    .maybeSingle<Book>();
  if (!book) notFound();

  const [sales, history] = await Promise.all([
    supabase
      .from("admin_book_sales")
      .select("reserved_qty, purchased_qty")
      .eq("book_id", id)
      .maybeSingle<{ reserved_qty: number; purchased_qty: number }>(),
    supabase
      .from("book_inventory")
      .select("id, created_at, delta, reason, note")
      .eq("book_id", id)
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<Movement[]>(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={book.title} intro={book.author} />

      <Panel title="Stock">
        <p className="mb-5 text-sm text-ink">
          Status: <StatusText status={label(book.status)} />
        </p>

        <dl className="mb-8 flex flex-wrap gap-x-8 gap-y-6">
          <Stat label="Available now" value={String(book.available_quantity)} />
          <Stat label="Total listed" value={String(book.initial_quantity)} />
          <Stat
            label="Reserved (awaiting payment)"
            value={String(sales.data?.reserved_qty ?? 0)}
          />
          <Stat
            label="Purchased"
            value={String(sales.data?.purchased_qty ?? 0)}
          />
        </dl>

        <StockForm bookId={book.id} />
      </Panel>

      <section>
        <h2 className="mb-4 font-display text-xl text-navy">
          Recent stock changes
        </h2>
        {history.data && history.data.length > 0 ? (
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Change</th>
                <th className={th}>Reason</th>
                <th className={th}>Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {history.data.map((m) => (
                <tr key={m.id}>
                  <td className={td}>{formatDateTime(m.created_at)}</td>
                  <td className={td}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </td>
                  <td className={td}>{stockReason(m.reason)}</td>
                  <td className={td}>{m.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        ) : (
          <p className="text-sm text-muted">No stock changes recorded yet.</p>
        )}
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl text-navy">Details</h2>
        <BookForm
          book={{
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description,
            price_kobo: book.price_kobo,
            status: book.status,
            cover_url: book.cover_url,
          }}
        />
      </section>
    </div>
  );
}
