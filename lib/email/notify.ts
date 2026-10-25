import "server-only";
import { after } from "next/server";
import { getSiteSettings } from "@/lib/data/settings";
import { formatNaira } from "@/lib/money";
import { siteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { compose, type Content } from "./layout";
import { sendMail } from "./transport";
import { siteName } from "./site-name";

/* ───────── Helpers ───────── */

// Runs after the response is sent, so the page is never slowed down by email.
// Still finishes on Vercel because `after` keeps the function alive.
export function queue(task: () => Promise<unknown>) {
  const run = async () => {
    try {
      await task();
    } catch (error) {
      console.error("email task failed:", error);
    }
  };
  try {
    after(run);
  } catch {
    void run();
  }
}

const deliver = async (to: string | null | undefined, content: Content) =>
  to ? sendMail({ to, ...compose(content, await siteName()) }) : false;

const copies = (n: number) => `${n} ${n === 1 ? "copy" : "copies"}`;

const lagos = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(iso));

type Admin = ReturnType<typeof createAdminClient>;

/* ───────── Applications ───────── */

type AppRow = {
  reference: string;
  status: string;
  applicant_name: string;
  organisation_name: string | null;
  email: string | null;
  fulfilment_method: "pickup" | "delivery";
  batch: { title: string } | null;
  pickup_location: { name: string; address: string } | null;
  application_items: {
    quantity_requested: number;
    quantity_approved: number;
    batch_book: { title: string } | null;
  }[];
};

const APP_SELECT = `reference, status, applicant_name, organisation_name, email, fulfilment_method,
  batch:batches(title),
  pickup_location:batch_locations(name, address),
  application_items(quantity_requested, quantity_approved, batch_book:batch_books(title))`;

async function loadApplication(by: { reference: string } | { id: string }) {
  const admin = createAdminClient();
  const query = admin.from("applications").select(APP_SELECT);
  const { data } =
    "reference" in by
      ? await query.eq("reference", by.reference).maybeSingle<AppRow>()
      : await query.eq("id", by.id).maybeSingle<AppRow>();
  return data;
}

const TRACK = {
  label: "Check your application",
  href: `${siteUrl}/apply/track`,
};

export async function emailApplicationReceived(reference: string) {
  const app = await loadApplication({ reference });
  if (!app?.email) return;

  await deliver(app.email, {
    subject: `We received your application (${app.reference})`,
    name: app.applicant_name,
    intro: [
      `Thank you for applying for books${app.batch ? ` in ${app.batch.title}` : ""}. We have received your application.`,
      "We read every application by hand. We may call you, and the reference person you gave if there is one, to confirm details.",
    ],
    rows: [
      ["Reference", app.reference],
      [
        "Books requested",
        app.application_items
          .map(
            (i) =>
              `${i.batch_book?.title ?? "Book"} (${copies(i.quantity_requested)})`,
          )
          .join("\n"),
      ],
      ["Status", "Waiting for review"],
    ],
    outro: [
      "You can check where your application stands at any time with your reference and the phone number you applied with.",
    ],
    button: TRACK,
  });
}

export async function emailApplicationDecision(
  id: string,
  outcome: "approved" | "rejected" | "fulfilled",
) {
  const app = await loadApplication({ id });
  if (!app?.email) return;

  const approvedBooks = app.application_items
    .filter((i) => i.quantity_approved > 0)
    .map(
      (i) =>
        `${i.batch_book?.title ?? "Book"} (${copies(i.quantity_approved)})`,
    )
    .join("\n");

  if (outcome === "approved") {
    const how =
      app.fulfilment_method === "pickup"
        ? app.pickup_location
          ? `Collect from ${app.pickup_location.name}, ${app.pickup_location.address}`
          : "Collection. We will confirm the place."
        : "Delivery. We will confirm the details by phone.";

    await deliver(app.email, {
      subject: `Your application was approved (${app.reference})`,
      name: app.applicant_name,
      intro: [
        "Alhamdulillah, your application has been approved.",
        "We will contact you on the phone number you gave about when and how to receive your books.",
      ],
      rows: [
        ["Reference", app.reference],
        ["Books approved", approvedBooks],
        ["How you will receive them", how],
      ],
      button: TRACK,
    });
    return;
  }

  if (outcome === "rejected") {
    await deliver(app.email, {
      subject: `Update on your application (${app.reference})`,
      name: app.applicant_name,
      intro: [
        "Thank you for applying. After careful review we are not able to approve your application in this batch.",
        "Copies are limited, and this does not reflect on you. You are welcome to apply in a future batch, and to reply to this email if you would like to ask anything.",
      ],
      rows: [["Reference", app.reference]],
    });
    return;
  }

  await deliver(app.email, {
    subject: `Your books have been handed over (${app.reference})`,
    name: app.applicant_name,
    intro: [
      "Our records show that your books have been handed over to you. May Allah make them a means of benefit.",
      "If this is not correct, please reply to this email and tell us.",
    ],
    rows: [
      ["Reference", app.reference],
      ["Books", approvedBooks],
    ],
  });
}

/* ───────── Book requests ───────── */

type RequestRow = {
  reference: string;
  requester_name: string;
  email: string | null;
  book_title: string;
  book_author: string | null;
  quantity: number;
};

async function loadRequest(by: { reference: string } | { id: string }) {
  const admin = createAdminClient();
  const query = admin
    .from("book_requests")
    .select(
      "reference, requester_name, email, book_title, book_author, quantity",
    );
  const { data } =
    "reference" in by
      ? await query.eq("reference", by.reference).maybeSingle<RequestRow>()
      : await query.eq("id", by.id).maybeSingle<RequestRow>();
  return data;
}

const requestRows = (r: RequestRow): [string, string][] => [
  ["Reference", r.reference],
  [
    "Book",
    r.book_author ? `${r.book_title}, by ${r.book_author}` : r.book_title,
  ],
  ["Copies", String(r.quantity)],
];

export async function emailBookRequestReceived(reference: string) {
  const r = await loadRequest({ reference });
  if (!r?.email) return;

  await deliver(r.email, {
    subject: `We received your book request (${r.reference})`,
    name: r.requester_name,
    intro: [
      "Thank you for telling us about the book you need. We have received your request and will review it.",
    ],
    rows: [...requestRows(r), ["Status", "Waiting for review"]],
    outro: [
      "You can check your request at any time with your reference and the phone number you used.",
    ],
    button: { label: "Check your request", href: `${siteUrl}/apply/track` },
  });
}

export async function emailBookRequestOutcome(
  id: string,
  outcome: "approved" | "rejected" | "fulfilled",
) {
  const r = await loadRequest({ id });
  if (!r?.email) return;

  const copy = {
    approved: {
      subject: `Your book request was approved (${r.reference})`,
      intro: [
        "Alhamdulillah, your book request has been approved and added to our list.",
        "Please note that we have not bought the book yet. We buy books as donations arrive, and we will contact you when yours is ready.",
      ],
    },
    rejected: {
      subject: `Update on your book request (${r.reference})`,
      intro: [
        "Thank you for your request. After careful review we are not able to approve it at this time.",
        "You are welcome to reply to this email if you would like to ask anything.",
      ],
    },
    fulfilled: {
      subject: `Your requested book has been handed over (${r.reference})`,
      intro: [
        "Our records show that the book you requested has been handed over. May Allah make it a means of benefit.",
        "If this is not correct, please reply to this email and tell us.",
      ],
    },
  }[outcome];

  await deliver(r.email, {
    subject: copy.subject,
    name: r.requester_name,
    intro: copy.intro,
    rows: requestRows(r),
  });
}

/* ───────── Payments and orders ───────── */

type PaymentRow = {
  reference: string;
  amount_kobo: number;
  status: string;
  channel: string | null;
  paid_at: string | null;
  donation: {
    type: "general" | "book";
    donor_name: string;
    donor_email: string | null;
    campaign_id: string | null;
    batch_id: string | null;
  } | null;
  order: {
    donor_name: string;
    donor_email: string | null;
    order_items: {
      quantity: number;
      unit_price_kobo: number;
      book: { title: string } | null;
    }[];
  } | null;
};

async function loadPayment(reference: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("payments")
    .select(
      `reference, amount_kobo, status, channel, paid_at,
       donation:donations(type, donor_name, donor_email, campaign_id, batch_id),
       order:orders(donor_name, donor_email, order_items(quantity, unit_price_kobo, book:books(title)))`,
    )
    .eq("reference", reference)
    .maybeSingle<PaymentRow>();
  return data;
}

const bookLines = (
  items: { quantity: number; book: { title: string } | null }[],
) => items.map((i) => `${i.book?.title ?? "Book"} × ${i.quantity}`).join("\n");

async function givenTo(admin: Admin, d: NonNullable<PaymentRow["donation"]>) {
  if (d.batch_id) {
    const { data } = await admin
      .from("batches")
      .select("title")
      .eq("id", d.batch_id)
      .maybeSingle<{ title: string }>();
    if (data) return data.title;
  }
  if (d.campaign_id) {
    const { data } = await admin
      .from("campaigns")
      .select("title")
      .eq("id", d.campaign_id)
      .maybeSingle<{ title: string }>();
    if (data) return data.title;
  }
  return "The Foundation’s general work";
}

// Used for card payments (after Paystack confirms) and for confirmed bank transfers
export async function emailPaymentReceipt(reference: string) {
  const p = await loadPayment(reference);
  if (!p || p.status !== "success") return;

  const to = p.donation?.donor_email ?? p.order?.donor_email;
  const name = p.donation?.donor_name ?? p.order?.donor_name;
  const isBooks = p.donation?.type === "book";
  const transfer = p.channel === "bank_transfer";

  const rows: [string, string][] = [
    ["Reference", p.reference],
    ["Amount", formatNaira(p.amount_kobo)],
    ["Date", lagos(p.paid_at ?? new Date().toISOString())],
  ];

  if (isBooks && p.order) {
    rows.push(["Books", bookLines(p.order.order_items)]);
  } else if (p.donation) {
    rows.push(["Given to", await givenTo(createAdminClient(), p.donation)]);
  }

  await deliver(to, {
    subject:
      `Receipt for your ${isBooks ? "book" : ""} donation (${p.reference})`.replace(
        "  ",
        " ",
      ),
    name,
    intro: [
      transfer
        ? "We have confirmed your bank transfer. Thank you."
        : "Thank you. Your payment has been received.",
    ],
    rows,
    outro: [
      isBooks
        ? "The Foundation will buy the books you chose and give them to students of knowledge and mosques in need. We will email you as your order moves along. May Allah reward you."
        : "Your donation will go towards providing beneficial books to students of knowledge and mosques. May Allah reward you.",
      "Please keep this email as your receipt.",
    ],
  });
}

// Sent right after a donor chooses bank transfer for a book order
export async function emailTransferInstructions(reference: string) {
  const p = await loadPayment(reference);
  if (!p?.order) return;

  const to = p.order.donor_email ?? p.donation?.donor_email;
  const {
    number,
    bank,
    name: accountName,
  } = (await getSiteSettings()).payments.books.bank;

  if (!number) {
    console.error("emailTransferInstructions: book bank details are empty");
    return;
  }

  await deliver(to, {
    subject: `Your book order is saved. Transfer details (${p.reference})`,
    name: p.order.donor_name,
    intro: [
      "Thank you for choosing to sponsor books. Your order is saved. To complete it, please make a bank transfer using the details below.",
      "Please put the reference in the narration or remark of your transfer. It is how we match your payment to your books.",
    ],
    rows: [
      ["Amount to transfer", formatNaira(p.amount_kobo)],
      ["Bank", bank],
      ["Account number", number],
      ["Account name", accountName],
      ["Reference (narration)", p.reference],
      ["Books", bookLines(p.order.order_items)],
    ],
    outro: [
      "When the money reaches the account we will confirm it and email you a receipt. If you have any trouble, just reply to this email.",
    ],
  });
}

type OrderRow = {
  reference: string;
  status: string;
  donor_name: string;
  donor_email: string | null;
  order_items: { quantity: number; book: { title: string } | null }[];
};

async function loadOrder(id: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select(
      "reference, status, donor_name, donor_email, order_items(quantity, book:books(title))",
    )
    .eq("id", id)
    .maybeSingle<OrderRow>();
  return data;
}

const ORDER_STEPS: Record<string, { subject: string; intro: string[] }> = {
  processing: {
    subject: "We have started buying your books",
    intro: ["The Foundation has started buying the books you funded."],
  },
  ready_for_distribution: {
    subject: "Your books are ready to be given out",
    intro: [
      "The books you funded have been bought and are ready to be given to students of knowledge and mosques.",
    ],
  },
  distributed: {
    subject: "The books you funded have been given out",
    intro: [
      "Alhamdulillah, the books you funded have been given out. May Allah accept it from you and reward you.",
    ],
  },
};

export async function emailOrderStatus(orderId: string) {
  const order = await loadOrder(orderId);
  const step = order ? ORDER_STEPS[order.status] : undefined;
  if (!order || !step) return;

  await deliver(order.donor_email, {
    subject: `${step.subject} (${order.reference})`,
    name: order.donor_name,
    intro: step.intro,
    rows: [
      ["Order", order.reference],
      ["Books", bookLines(order.order_items)],
    ],
  });
}

export async function emailOrderCancelled(orderId: string) {
  const order = await loadOrder(orderId);
  if (!order) return;

  await deliver(order.donor_email, {
    subject: `Your book order was cancelled (${order.reference})`,
    name: order.donor_name,
    intro: [
      "Your book order has been cancelled because we did not receive the transfer.",
      "If you have already sent the money, please reply to this email with your transfer receipt and we will put it right.",
    ],
    rows: [["Order", order.reference]],
  });
}

/* ───────── Batches: told to the people who gave to that batch ───────── */

export async function emailBatchUpdate(
  batchId: string,
  kind: "funded" | "opened",
) {
  const admin = createAdminClient();

  // Each kind of email goes out at most once per batch, however often the
  // status or the raised amount is changed afterwards
  const { data: claimed, error: claimError } = await admin
    .from("batch_email_log")
    .upsert(
      { batch_id: batchId, kind },
      { onConflict: "batch_id,kind", ignoreDuplicates: true },
    )
    .select("batch_id");

  if (claimError) {
    console.error("emailBatchUpdate claim:", claimError.message);
    return;
  }
  if (!claimed?.length) return;

  const { data: batch } = await admin
    .from("batches")
    .select("title")
    .eq("id", batchId)
    .maybeSingle<{ title: string }>();
  if (!batch) return;

  const { data: donations } = await admin
    .from("donations")
    .select("donor_name, donor_email")
    .eq("batch_id", batchId)
    .eq("is_paid", true)
    .not("donor_email", "is", null)
    .returns<{ donor_name: string; donor_email: string }[]>();

  // One email per person, however many times they gave
  const people = new Map<string, string>();
  for (const d of donations ?? []) {
    const key = d.donor_email.trim().toLowerCase();
    if (!people.has(key)) people.set(key, d.donor_name);
  }

  // Gmail allows about 500 emails a day, so stay well below that
  const list = [...people].slice(0, 400);

  const content = (name: string): Content =>
    kind === "funded"
      ? {
          subject: `${batch.title} has reached its target`,
          name,
          intro: [
            `Alhamdulillah, ${batch.title} has reached its target. Thank you for being part of it.`,
            "The Foundation will now buy the books and prepare to give them out. May Allah reward you.",
          ],
        }
      : {
          subject: `Applications are now open for ${batch.title}`,
          name,
          intro: [
            `Applications are now open for ${batch.title}, which you helped fund.`,
            "Thank you. The books your gift made possible are now being given to people who apply. May Allah reward you.",
          ],
          button: { label: "See the batch", href: `${siteUrl}/apply` },
        };

  // A few at a time, so a long list stays quick
  for (let i = 0; i < list.length; i += 5) {
    await Promise.all(
      list
        .slice(i, i + 5)
        .map(([email, name]) => deliver(email, content(name))),
    );
  }
}
