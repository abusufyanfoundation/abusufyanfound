import Link from "next/link";
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
import { formatNaira } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

const STATUSES = [
  "pending_payment",
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
  reference: string;
  created_at: string;
  status: string;
  payment_method: "paystack" | "transfer";
  total_kobo: number;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string | null;
  order_items: {
    quantity: number;

    book: {
      title: string;
    } | null;
  }[];
};

const outline =
  "border border-navy px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";

function refresh() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/activity");
}

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

  refresh();
}

async function confirmTransfer(formData: FormData) {
  "use server";

  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const reference = String(formData.get("reference") ?? "");
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 200);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_transfer_payment", {
    p_order_id: id,
    p_note: note || null,
  });

  if (error || data !== "SUCCESS") {
    console.error("confirmTransfer:", error?.message ?? data);
    return;
  }

  await logAudit(supabase, actor, {
    action: "order.payment_confirmed",
    entity: "order",
    entityId: id,
    summary: `Confirmed bank transfer received for order ${reference}`,
    details: { note: note || null },
  });

  refresh();
}

async function cancelTransfer(formData: FormData) {
  "use server";

  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const reference = String(formData.get("reference") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancel_transfer_order", {
    p_order_id: id,
  });

  if (error || data !== "SUCCESS") {
    console.error("cancelTransfer:", error?.message ?? data);
    return;
  }

  await logAudit(supabase, actor, {
    action: "order.cancelled",
    entity: "order",
    entityId: id,
    summary: `Cancelled unpaid transfer order ${reference}`,
  });

  refresh();
}

export default async function OrdersPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        reference,
        created_at,
        status,
        payment_method,
        total_kobo,
        donor_name,
        donor_email,
        donor_phone,
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
        intro="Book pre-fund orders. A transfer order stays awaiting payment until you confirm the money has arrived in the book pre-fund account."
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
              <th className={th}>Payment</th>
              <th className={th}>Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-rule">
            {data.map((order) => {
              const awaiting =
                order.payment_method === "transfer" &&
                order.status === "pending_payment";

              return (
                <tr key={order.id}>
                  <td className={td}>{formatDateTime(order.created_at)}</td>

                  <td className={td}>
                    {order.donor_name ?? "—"}

                    <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted">
                      {order.donor_email && (
                        <Link href={`mailto:${order.donor_email}`}>
                          {order.donor_email}
                        </Link>
                      )}
                      {order.donor_phone && (
                        <Link
                          href={`tel:${order.donor_phone.replace(/[^\d+]/g, "")}`}
                        >
                          {order.donor_phone}
                        </Link>
                      )}
                    </div>
                  </td>

                  <td className={td}>
                    {order.order_items.map((item, index) => (
                      <div key={index}>
                        {item.quantity} × {item.book?.title ?? "Unknown book"}
                      </div>
                    ))}
                  </td>

                  <td className={td}>
                    {formatNaira(order.total_kobo)}
                    <div className="mt-1 text-xs text-muted">
                      {order.payment_method === "transfer"
                        ? "Bank transfer"
                        : "Paystack"}
                    </div>
                    <div className="mt-1 break-all font-mono text-xs text-muted">
                      {order.reference}
                    </div>
                  </td>

                  <td className={td}>
                    {awaiting ? (
                      <div className="flex flex-col gap-3">
                        <StatusText status="Pending" />
                        <span className="text-xs text-muted">
                          Awaiting transfer
                        </span>

                        <form
                          action={confirmTransfer}
                          className="flex flex-col gap-2"
                        >
                          <input type="hidden" name="id" value={order.id} />
                          <input
                            type="hidden"
                            name="reference"
                            value={order.reference}
                          />
                          <input
                            name="note"
                            maxLength={200}
                            placeholder="Note, e.g. bank narration (optional)"
                            className="border border-rule bg-white px-2 py-2 text-sm"
                          />
                          <button type="submit" className={outline}>
                            Confirm payment received
                          </button>
                        </form>

                        <form action={cancelTransfer}>
                          <input type="hidden" name="id" value={order.id} />
                          <input
                            type="hidden"
                            name="reference"
                            value={order.reference}
                          />
                          <button
                            type="submit"
                            className="text-xs text-muted underline underline-offset-4 hover:text-navy"
                          >
                            Cancel order
                          </button>
                        </form>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
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
