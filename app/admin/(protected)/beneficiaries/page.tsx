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
  book: string | null;
  created_at: string;
};

const label = (value: string) => {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export default async function BeneficiariesPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beneficiaries")
    .select("id, name, type, location, book, created_at")
    .order("created_at", {
      ascending: false,
    })
    .returns<Beneficiary[]>();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Beneficiaries"
        intro="Keep the students and mosques served by the Foundation in one place."
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
              <option value="student">Student</option>

              <option value="mosque">Mosque</option>
            </select>
          </label>

          <label className="text-sm text-muted">
            Location
            <input
              name="location"
              className="mt-1 w-full border border-rule px-3 py-2 text-sm text-ink"
            />
          </label>

          <label className="text-sm text-muted">
            Book
            <textarea
              name="book"
              rows={3}
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
              <th className={th}>Added</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-rule">
            {data.map((beneficiary) => (
              <tr key={beneficiary.id}>
                <td className={td}>
                  <p>{beneficiary.name}</p>

                  {beneficiary.book && (
                    <p className="mt-1 max-w-sm text-xs text-muted">
                      {beneficiary.book}
                    </p>
                  )}
                </td>

                <td className={td}>{label(beneficiary.type)}</td>

                <td className={td}>{beneficiary.location ?? "N/A"}</td>

                <td className={td}>{formatDateTime(beneficiary.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      ) : (
        <EmptyState
          title="No beneficiaries yet"
          text="Add the first student or mosque above."
        />
      )}
    </div>
  );
}
