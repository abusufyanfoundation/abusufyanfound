import { revalidatePath } from "next/cache";
import {
  EmptyState,
  PageHeader,
  TableWrap,
  StatusText,
  td,
  th,
} from "@/components/admin/ui";
import { logAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "ready_for_distribution",
  "distributed",
  "cancelled",
] as const;

type OrderStatus = (typeof STATUSES)[number];

const label = (value: string) => {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

type Order = {
  id: string;
  created_at: string;
  status: string;

  donation: {
    donor_name: string;
    donor_email: string | null;
  } | null;

  order_items: {
    quantity: number;

    book: {
      title: string;
    } | null;
  }[];
};

async function updateOrder(formData: FormData) {
  "use server";

  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");

  const status = String(formData.get("status") ?? "");

  if (!id || !STATUSES.includes(status as OrderStatus)) {
    return;
  }

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle<{
      status: string;
    }>();

  if (!before) {
    return;
  }

  if (before.status === status) {
    return;
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status,
    })
    .eq("id", id);

  if (error) {
    console.error("updateOrder:", error.message);

    return;
  }

  await logAudit(supabase, actor, {
    action: "order.status_updated",
    entity: "order",
    entityId: id,
    summary: `Changed order status to ${label(status)}`,
    details: {
      from: before.status,
      to: status,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/activity");
}

export default async function OrdersPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        created_at,
        status,
        donation:donations(
          donor_name,
          donor_email
        ),
        order_items(
          quantity,
          book:books(title)
        )
      `,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(100)
    .returns<Order[]>();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Orders"
        intro="Track book pre-fund orders through fulfilment and distribution."
      />

      {error ? (
        <p
          role="alert"
          className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Orders could not be loaded.
        </p>
      ) : data?.length ? (
        <TableWrap>
          <thead className="border-b border-rule bg-paper">
            <tr>
              <th className={th}>Date</th>
              <th className={th}>Donor</th>
              <th className={th}>Books</th>
              <th className={th}>Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-rule">
            {data.map((order) => (
              <tr key={order.id}>
                <td className={td}>{formatDateTime(order.created_at)}</td>

                <td className={td}>
                  {order.donation?.donor_name ?? "—"}

                  <br />

                  <span className="text-xs text-muted">
                    {order.donation?.donor_email ?? ""}
                  </span>
                </td>

                <td className={td}>
                  {order.order_items.map((item, index) => (
                    <div key={index}>
                      {item.quantity} × {item.book?.title ?? "Unknown book"}
                    </div>
                  ))}
                </td>

                <td className={td}>
                  <form
                    action={updateOrder}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={order.id} />

                    <select
                      name="status"
                      defaultValue={order.status}
                      className="border border-rule bg-white px-2 py-2 text-sm"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {label(status)}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="text-sm text-navy underline decoration-gold underline-offset-4"
                    >
                      Save
                    </button>
                  </form>

                  <div className="mt-2">
                    <StatusText status={label(order.status)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      ) : (
        <EmptyState
          title="No orders yet"
          text="Book pre-fund orders will appear here after checkout."
        />
      )}
    </div>
  );
}
