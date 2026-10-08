import { notFound } from "next/navigation";
import { BookForm } from "@/components/admin/BookForm";
import {
  PageHeader,
  Panel,
  Stat,
  StatGrid,
  StatusText,
} from "@/components/admin/ui";
import { bookStatusLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatNaira } from "@/lib/money";
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
  status: string;
};

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
    .select("id, title, author, description, cover_url, price_kobo, status")
    .eq("id", id)
    .maybeSingle<Book>();
  if (!book) notFound();

  const { data: funding } = await supabase
    .from("admin_book_funding")
    .select("funded_qty, distributed_qty")
    .eq("book_id", id)
    .maybeSingle<{ funded_qty: number; distributed_qty: number }>();

  const funded = funding?.funded_qty ?? 0;
  const distributed = funding?.distributed_qty ?? 0;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{ label: "Back to books", href: "/admin/books" }}
        title={book.title}
        intro={book.author}
      />

      <Panel title="Funding">
        <p className="mb-5 text-sm text-ink">
          Status: <StatusText status={bookStatusLabel(book.status)} />
        </p>

        <StatGrid>
          <Stat label="Price per copy" value={formatNaira(book.price_kobo)} />
          <Stat label="Copies funded" value={String(funded)} />
          <Stat label="Distributed" value={String(distributed)} />
          <Stat
            label="Still to deliver"
            value={String(Math.max(0, funded - distributed))}
          />
        </StatGrid>

        <p className="mt-5 max-w-lg text-xs leading-relaxed text-muted">
          Copies are bought only after a donor has paid for them. &ldquo;Copies
          funded&rdquo; counts paid orders.
        </p>
      </Panel>

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
