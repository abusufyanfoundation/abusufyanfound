import { createBeneficiary } from "./actions";
import {
  EmptyState,
  PageHeader,
  Panel,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type Beneficiary = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  application_id: string | null;
  book_request_id: string | null;
  created_at: string;
  distributions: {
    distribution_items: {
      quantity: number;
      book: { title: string } | null;
      batch_book: { title: string } | null;
    }[];
  }[];
};

const label = (value: string) => {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const source = (b: Beneficiary) =>
  b.application_id
    ? "Application"
    : b.book_request_id
      ? "Book request"
      : "Added by admin";

// Adds up the copies of each book this beneficiary has received
const booksReceived = (b: Beneficiary) => {
  const totals = new Map<string, number>();

  for (const distribution of b.distributions) {
    for (const item of distribution.distribution_items) {
      const title = item.batch_book?.title ?? item.book?.title ?? "Book";
      totals.set(title, (totals.get(title) ?? 0) + item.quantity);
    }
  }

  return [...totals.entries()];
};

export default async function BeneficiariesPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beneficiaries")
    .select(
      `id, name, type, location, application_id, book_request_id, created_at,
       distributions(
         distribution_items(
           quantity,
           book:books(title),
           batch_book:batch_books(title)
         )
       )`,
    )
    .order("created_at", {
      ascending: false,
    })
    .returns<Beneficiary[]>();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Beneficiaries"
        intro="Keep the individuals, mosques and schools served by the Foundation in one place, with the books each has received."
      />

      <Panel title="Add beneficiary">
        <form action={createBeneficiary} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-muted">
            Name
            <input
              required
              name="name"
              className="mt-1 w-full border border-rule px-3 py-2 text-sm text-ink"
            />
          </label>

          <label className="text-sm text-muted">
            Type
            <select
              required
              name="type"
              className="mt-1 w-full border border-rule bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="individual">Individual</option>

              <option value="mosque">Mosque</option>

              <option value="school">School</option>
            </select>
          </label>

          <label className="text-sm text-muted md:col-span-2">
            Location
            <input
              name="location"
              className="mt-1 w-full border border-rule px-3 py-2 text-sm text-ink"
            />
          </label>

          <button
            type="submit"
            className="w-fit bg-navy px-5 py-2 text-sm font-medium text-white hover:bg-navy-deep md:col-span-2"
          >
            Add beneficiary
          </button>
        </form>
      </Panel>

      {error ? (
        <p
          role="alert"
          className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Beneficiaries could not be loaded.
        </p>
      ) : data?.length ? (
        <TableWrap>
          <thead className="border-b border-rule bg-paper">
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Type</th>
              <th className={th}>Location</th>
              <th className={th}>Books received</th>
              <th className={th}>Source</th>
              <th className={th}>Added</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-rule">
            {data.map((beneficiary) => {
              const books = booksReceived(beneficiary);

              return (
                <tr key={beneficiary.id}>
                  <td className={td}>{beneficiary.name}</td>

                  <td className={td}>{label(beneficiary.type)}</td>

                  <td className={td}>{beneficiary.location ?? "N/A"}</td>

                  <td className={td}>
                    {books.length ? (
                      books.map(([title, quantity]) => (
                        <div key={title}>
                          {quantity} × {title}
                        </div>
                      ))
                    ) : (
                      <span className="text-muted">None yet</span>
                    )}
                  </td>

                  <td className={td}>{source(beneficiary)}</td>

                  <td className={td}>
                    {formatDateTime(beneficiary.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      ) : (
        <EmptyState
          title="No beneficiaries yet"
          text="Add the first individual, mosque or school above."
        />
      )}
    </div>
  );
}
