import Link from "next/link";
import { revalidatePath } from "next/cache";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import {
  AdminPagination,
  EmptyState,
  PageHeader,
  StatusText,
  TableWrap,
  td,
  th,
} from "@/components/admin/ui";
import { logAudit } from "@/lib/admin/audit";
import { flash } from "@/lib/admin/flash";
import {
  pageField,
  pageFrom,
  pagesFor,
  rangeFor,
} from "@/lib/admin/pagination";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  emailOrderCancelled,
  emailOrderStatus,
  emailPaymentReceipt,
  queue,
} from "@/lib/email/notify";
import { formatDateTime } from "@/lib/format";
import { formatNaira } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

export const metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

const PATH = "/admin/orders";

const STATUSES = [
  "paid",
  "processing",
  "ready_for_distribution",
  "distributed",
] as const;

type OrderStatus = (typeof STATUSES)[number];

const LABELS: Record<string, string> = {
  processing: "Processing purchase",
};

const label = (value: string) =>
  LABELS[value] ??
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

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
    book: { title: string } | null;
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
  const keep = { page: pageField(formData) };
  const fail = (message: string): never => flash(PATH, "error", message, keep);

  if (!isUuid(id) || !STATUSES.includes(status as OrderStatus)) {
    return fail("That status is not valid.");
  }

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle<{ status: string }>();

  if (!before) return fail("Order not found.");

  // Only a funded order moves along the fulfilment steps
  if (!STATUSES.includes(before.status as OrderStatus)) {
    return fail("This order cannot be changed.");
  }

  if (before.status === status) {
    return flash(PATH, "notice", "The status was already set.", keep);
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("updateOrder:", error.message);
    return fail("The order status could not be saved.");
  }

  await logAudit(supabase, actor, {
    action: "order.status_updated",
    entity: "order",
    entityId: id,
    summary: `Changed order status to ${label(status)}`,
    details: { from: before.status, to: status },
  });

  queue(() => emailOrderStatus(id));

  refresh();
  return flash(
    PATH,
    "notice",
    `Order status changed to ${label(status)}.`,
    keep,
  );
}

async function confirmTransfer(formData: FormData) {
  "use server";

  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const reference = String(formData.get("reference") ?? "");
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 200);
  const keep = { page: pageField(formData) };
  const fail = (message: string): never => flash(PATH, "error", message, keep);

  if (!isUuid(id)) return fail("Order not found.");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_transfer_payment", {
    p_order_id: id,
    p_note: note || null,
  });

  if (error || data !== "SUCCESS") {
    console.error("confirmTransfer:", error?.message ?? data);
    return fail(
      "The payment could not be confirmed. It may already be confirmed or cancelled, so reload and check.",
    );
  }

  await logAudit(supabase, actor, {
    action: "order.payment_confirmed",
    entity: "order",
    entityId: id,
    summary: `Confirmed bank transfer received for order ${reference}`,
    details: { note: note || null },
  });

  queue(() => emailPaymentReceipt(reference));

  refresh();
  return flash(
    PATH,
    "notice",
    `Payment confirmed for order ${reference}. The donor has been emailed a receipt.`,
    keep,
  );
}

async function cancelTransfer(formData: FormData) {
  "use server";

  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const reference = String(formData.get("reference") ?? "");
  const keep = { page: pageField(formData) };
  const fail = (message: string): never => flash(PATH, "error", message, keep);

  if (!isUuid(id)) return fail("Order not found.");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancel_transfer_order", {
    p_order_id: id,
  });

  if (error || data !== "SUCCESS") {
    console.error("cancelTransfer:", error?.message ?? data);
    return fail(
      "The order could not be cancelled. It may already be paid or cancelled, so reload and check.",
    );
  }

  await logAudit(supabase, actor, {
    action: "order.cancelled",
    entity: "order",
    entityId: id,
    summary: `Cancelled unpaid transfer order ${reference}`,
  });

  queue(() => emailOrderCancelled(id));

  refresh();
  return flash(PATH, "notice", `Order ${reference} cancelled.`, keep);
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string; notice?: string }>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const page = pageFrom(sp.page);
  const { from, to } = rangeFor(page);

  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("orders")
    .select(
      `id, reference, created_at, status, payment_method, total_kobo,
       donor_name, donor_email, donor_phone,
       order_items(quantity, book:books(title))`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<Order[]>();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Orders"
        intro="Book pre-fund orders. A transfer order stays awaiting payment until you confirm the money has arrived in the book pre-fund account."
      />

      {sp.error && <FormMessage error={sp.error} />}
      {sp.notice && <FormMessage message={sp.notice} />}

      {error ? (
        <p
          role="alert"
          className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Orders could not be loaded.
        </p>
      ) : data?.length ? (
        <>
          <TableWrap>
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Donor</th>
                <th className={th}>Books</th>
                <th className={th}>Payment</th>
                <th className={th}>Status</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-rule">
              {data.map((order) => {
                const awaiting =
                  order.payment_method === "transfer" &&
                  order.status === "pending_payment";
                const closed =
                  order.status === "pending_payment" ||
                  order.status === "cancelled";
                const updatable = !awaiting && !closed;
                const formId = `order-${order.id}`;

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
                          <StatusText status="Pending payment" />
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
                            <input type="hidden" name="page" value={page} />
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
                            <input type="hidden" name="page" value={page} />
                            <button
                              type="submit"
                              className="bg-red-700 px-3 py-2 text-sm text-white"
                            >
                              Cancel order
                            </button>
                          </form>
                        </div>
                      ) : closed ? (
                        <>
                          <StatusText status={label(order.status)} />
                          <p className="mt-1 text-xs text-muted">
                            {order.status === "pending_payment"
                              ? "Updates by itself when Paystack confirms the payment."
                              : "This order is closed."}
                          </p>
                        </>
                      ) : (
                        <>
                          <form
                            key={`${order.id}-${order.status}`}
                            id={formId}
                            action={updateOrder}
                            className="flex items-center gap-2"
                          >
                            <input type="hidden" name="id" value={order.id} />
                            <input type="hidden" name="page" value={page} />

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
                          </form>

                          <div className="mt-2">
                            Status: <StatusText status={label(order.status)} />
                          </div>
                        </>
                      )}
                    </td>

                    <td className={td}>
                      {updatable ? (
                        <button
                          type="submit"
                          form={formId}
                          className="bg-gold-deep px-3 py-2 text-sm text-white"
                        >
                          Save
                        </button>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>

          <AdminPagination
            basePath={PATH}
            params={{}}
            page={page}
            totalPages={pagesFor(count)}
          />
        </>
      ) : (
        <EmptyState
          title="No orders yet"
          text="Book pre-fund orders will appear here after checkout."
        />
      )}
    </div>
  );
}
