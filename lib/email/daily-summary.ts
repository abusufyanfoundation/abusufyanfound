import "server-only";
import { formatNaira } from "@/lib/money";
import { siteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { compose } from "./layout";
import { sendMail } from "./transport";

const head = { count: "exact", head: true } as const;

export async function sendDailySummary() {
  const admin = createAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    newApps,
    newRequests,
    pendingApps,
    approvedApps,
    pendingRequests,
    awaitingTransfers,
    donations,
  ] = await Promise.all([
    admin.from("applications").select("id", head).gte("created_at", since),
    admin.from("book_requests").select("id", head).gte("created_at", since),
    admin.from("applications").select("id", head).eq("status", "pending"),
    admin.from("applications").select("id", head).eq("status", "approved"),
    admin.from("book_requests").select("id", head).eq("status", "pending"),
    admin
      .from("orders")
      .select("id", head)
      .eq("payment_method", "transfer")
      .eq("status", "pending_payment"),
    admin
      .from("donations")
      .select("amount_kobo")
      .eq("is_paid", true)
      .gte("created_at", since)
      .returns<{ amount_kobo: number }[]>(),
  ]);

  const n = (r: { count: number | null }) => r.count ?? 0;
  const paid = donations.data ?? [];
  const paidTotal = paid.reduce((sum, d) => sum + d.amount_kobo, 0);

  const numbers = [
    n(newApps),
    n(newRequests),
    n(pendingApps),
    n(approvedApps),
    n(pendingRequests),
    n(awaitingTransfers),
    paid.length,
  ];

  // A quiet day with nothing waiting does not need an email
  if (numbers.every((x) => x === 0))
    return { sent: 0, reason: "nothing to report" };

  const { data: admins } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("role", "admin")
    .eq("is_active", true)
    .returns<{ id: string; full_name: string | null }[]>();

  const today = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "Africa/Lagos",
  }).format(new Date());

  let sent = 0;

  for (const person of admins ?? []) {
    const { data } = await admin.auth.admin.getUserById(person.id);
    const email = data.user?.email;
    if (!email) continue;

    const ok = await sendMail({
      to: email,
      ...compose({
        subject: `Foundation daily summary, ${today}`,
        name: person.full_name,
        intro: [
          "Here is what happened on the website in the last 24 hours, and what is waiting for you.",
        ],
        rows: [
          ["New applications", String(n(newApps))],
          ["New book requests", String(n(newRequests))],
          [
            "Paid donations",
            paid.length ? `${paid.length} (${formatNaira(paidTotal)})` : "0",
          ],
          ["Applications to review", String(n(pendingApps))],
          ["Approved, not yet handed over", String(n(approvedApps))],
          ["Book requests to review", String(n(pendingRequests))],
          ["Transfers waiting to be confirmed", String(n(awaitingTransfers))],
        ],
        button: { label: "Open the dashboard", href: `${siteUrl}/admin` },
      }),
    });
    if (ok) sent += 1;
  }

  return { sent };
}
