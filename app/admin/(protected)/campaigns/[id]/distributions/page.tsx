import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { PageHeader, Panel, TableWrap, td, th } from "@/components/admin/ui";
import { logAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

async function recordDistribution(formData: FormData) {
  "use server";

  const actor = await requireAdmin();

  const campaignId = String(formData.get("campaign_id") ?? "");

  const beneficiaryId = String(formData.get("beneficiary_id") ?? "");

  const bookId = String(formData.get("book_id") ?? "");

  const quantity = Number(formData.get("quantity"));

  const notes = String(formData.get("notes") ?? "").trim();

  if (
    !campaignId ||
    !beneficiaryId ||
    !bookId ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("distributions")
    .insert({
      campaign_id: campaignId,
      beneficiary_id: beneficiaryId,
      book_id: bookId,
      quantity,
      notes: notes || null,
    })
    .select("id")
    .single<{
      id: string;
    }>();

  if (error || !data) {
    console.error("recordDistribution:", error?.message);

    return;
  }

  await logAudit(supabase, actor, {
    action: "distribution.created",
    entity: "campaign",
    entityId: campaignId,
    summary: `Recorded distribution of ${quantity} book(s)`,
    details: {
      campaign_id: campaignId,
      beneficiary_id: beneficiaryId,
      book_id: bookId,
      quantity,
    },
  });

  revalidatePath(`/admin/campaigns/${campaignId}`);

  revalidatePath(`/admin/campaigns/${campaignId}/distributions`);

  revalidatePath("/admin");
  revalidatePath("/admin/activity");
}

type DistributionRow = {
  id: string;
  quantity: number;
  created_at: string;
  notes: string | null;

  beneficiary: {
    name: string;
    type: string;
  } | null;

  book: {
    title: string;
  } | null;
};

type Option = {
  id: string;
  name?: string;
  title?: string;
};

export default async function DistributionsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  await requireAdmin();

  const supabase = await createClient();

  const [campaign, beneficiaries, books, distributions] = await Promise.all([
    supabase.from("campaigns").select("id, title").eq("id", id).maybeSingle<{
      id: string;
      title: string;
    }>(),

    supabase
      .from("beneficiaries")
      .select("id, name")
      .order("name")
      .returns<Option[]>(),

    supabase
      .from("books")
      .select("id, title")
      .order("title")
      .returns<Option[]>(),

    supabase
      .from("distributions")
      .select(
        `
          id,
          quantity,
          created_at,
          notes,
          beneficiary:beneficiaries(
            name,
            type
          ),
          book:books(
            title
          )
        `,
      )
      .eq("campaign_id", id)
      .order("created_at", {
        ascending: false,
      })
      .returns<DistributionRow[]>(),
  ]);

  if (!campaign.data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Campaign distributions"
        intro={`Record books purchased with funds from "${campaign.data.title}" and where they went.`}
        back={{
          label: "Back to campaign",
          href: `/admin/campaigns/${id}`,
        }}
      />

      <Panel title="Record distribution">
        <form action={recordDistribution} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="campaign_id" value={id} />

          <label className="text-sm text-muted">
            Beneficiary
            <select
              required
              name="beneficiary_id"
              className="mt-1 w-full border border-rule bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="">Select beneficiary</option>

              {(beneficiaries.data ?? []).map((beneficiary) => (
                <option key={beneficiary.id} value={beneficiary.id}>
                  {beneficiary.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-muted">
            Book
            <select
              required
              name="book_id"
              className="mt-1 w-full border border-rule bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="">Select book</option>

              {(books.data ?? []).map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-muted">
            Quantity
            <input
              required
              min={1}
              type="number"
              name="quantity"
              className="mt-1 w-full border border-rule px-3 py-2 text-sm text-ink"
            />
          </label>

          <label className="text-sm text-muted">
            Notes
            <textarea
              name="notes"
              rows={3}
              className="mt-1 w-full border border-rule px-3 py-2 text-sm text-ink"
            />
          </label>

          <button
            type="submit"
            className="w-fit bg-navy px-5 py-2 text-sm font-medium text-white hover:bg-navy-deep md:col-span-2"
          >
            Record distribution
          </button>
        </form>
      </Panel>

      <TableWrap>
        <thead className="border-b border-rule bg-paper">
          <tr>
            <th className={th}>Book</th>
            <th className={th}>Beneficiary</th>
            <th className={th}>Quantity</th>
            <th className={th}>Notes</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-rule">
          {(distributions.data ?? []).map((distribution) => (
            <tr key={distribution.id}>
              <td className={td}>
                {distribution.book?.title ?? "Unknown book"}
              </td>

              <td className={td}>
                {distribution.beneficiary?.name ?? "Unknown beneficiary"}
              </td>

              <td className={td}>{distribution.quantity}</td>

              <td className={td}>{distribution.notes ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
