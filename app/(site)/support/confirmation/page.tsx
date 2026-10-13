import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ClearSelection } from "@/components/site/support/ClearSelection";
import { BankDetailsCard } from "@/components/site/support/BankDetails";
import { Container } from "@/components/site/Container";
import { getSiteSettings } from "@/lib/data/settings";
import { formatNaira } from "@/lib/money";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Payment confirmation",
  robots: { index: false, follow: false },
};

type PaymentView = {
  reference: string;
  amount_kobo: number;
  status: "pending" | "success" | "failed" | "abandoned";
  channel: string | null;
  paid_at: string | null;
  donation: { type: "general" | "book" } | null;
  order: {
    order_items: {
      quantity: number;
      unit_price_kobo: number;
      book: { title: string } | null;
    }[];
  } | null;
};

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(iso));

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-rule py-4 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink sm:text-right">{value}</dd>
    </div>
  );
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  let payment: PaymentView | null = null;
  if (reference) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("payments")
      .select(
        "reference, amount_kobo, status, channel, paid_at, donation:donations(type), order:orders(order_items(quantity, unit_price_kobo, book:books(title)))",
      )
      .eq("reference", reference)
      .maybeSingle<PaymentView>();
    payment = data;
  }

  if (!payment) {
    return (
      <section className="py-20 md:py-28">
        <Container>
          <h1 className="text-3xl md:text-4xl">
            We could not find that payment
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            The link may be incomplete. If you have just paid, please wait a
            moment and open the link again.
          </p>
          <div className="mt-8">
            <ButtonLink href="/">Back to the website</ButtonLink>
          </div>
        </Container>
      </section>
    );
  }

  const settings = await getSiteSettings();
  const success = payment.status === "success";
  const pending = payment.status === "pending";
  const isBooks = payment.donation?.type === "book";
  const isTransfer = payment.channel === "bank_transfer";
  const awaitingTransfer = isTransfer && pending;
  const items = payment.order?.order_items ?? [];
  const { email, phones } = settings.contact;

  return (
    <section className="py-20 md:py-28">
      <Container>
        {isBooks && (success || awaitingTransfer) && <ClearSelection />}

        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.18em] text-gold-deep uppercase sm:text-sm">
            {awaitingTransfer
              ? "Awaiting your transfer"
              : success
                ? isTransfer
                  ? "Payment confirmed"
                  : "Payment successful"
                : pending
                  ? "Payment pending"
                  : "Payment not completed"}
          </p>

          <h1 className="mt-4 text-3xl md:text-5xl">
            {awaitingTransfer
              ? "Your order is saved. Now make the transfer."
              : success
                ? "Thank you for your support."
                : pending
                  ? "We are confirming your payment."
                  : "Your payment was not completed."}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            {awaitingTransfer
              ? "Transfer exactly the amount below to this account and put the reference in the narration, so we can match your payment to your books. We will confirm it when the money arrives."
              : success
                ? isBooks
                  ? "Your payment has been received. The Foundation will buy the books you chose and give them to students of knowledge and mosques in need. May Allah reward you."
                  : "Your donation has been received. It will go towards providing beneficial books to students of knowledge and mosques. May Allah reward you."
                : pending
                  ? "This can take a minute. If you have already paid, please check again shortly. You will not be charged twice."
                  : "No money was taken, or the payment was declined. You can try again whenever you are ready."}
          </p>

          {awaitingTransfer && (
            <div className="mt-8">
              <BankDetailsCard
                bank={settings.payments.books.bank}
                reference={payment.reference}
              />
            </div>
          )}

          <dl className="mt-10">
            <Row
              label="Status"
              value={
                awaitingTransfer
                  ? "Awaiting transfer"
                  : success
                    ? "Paid"
                    : pending
                      ? "Pending"
                      : "Not completed"
              }
            />
            <Row label="Reference" value={payment.reference} />
            <Row label="Amount" value={formatNaira(payment.amount_kobo)} />
            {payment.paid_at && (
              <Row label="Date" value={formatDateTime(payment.paid_at)} />
            )}
            <Row label="Type" value={isBooks ? "Book pre-fund" : "Donation"} />
          </dl>

          {isBooks && items.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-2xl text-navy">Books</h2>
              <ul className="mt-3 divide-y divide-rule border-y border-rule">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <span className="text-ink">
                      {item.book?.title ?? "Book"}
                      <span className="text-sm text-muted">
                        {" "}
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="text-sm text-muted">
                      {formatNaira(item.unit_price_kobo * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {awaitingTransfer && (email || phones.length > 0) && (
            <div className="mt-8 border-l-2 border-gold pl-5">
              <h2 className="font-display text-xl text-navy">
                Having a problem?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                If your transfer did not go through, or you have a question,
                contact us and quote your reference.
              </p>
              <ul className="mt-3 flex flex-col gap-1 text-sm">
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(`Book order ${payment.reference}`)}`}
                      className="text-navy underline decoration-gold underline-offset-4"
                    >
                      {email}
                    </a>
                  </li>
                )}
                {phones.map((p) => (
                  <li key={p}>
                    <a
                      href={`tel:${p.replace(/[^\d+]/g, "")}`}
                      className="text-navy underline decoration-gold underline-offset-4"
                    >
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <ButtonLink href="/">Back to the website</ButtonLink>
            {pending && !awaitingTransfer && (
              <Link
                href={`/support/confirmation?reference=${encodeURIComponent(payment.reference)}`}
                className="text-sm text-navy underline decoration-gold underline-offset-4"
              >
                Check again
              </Link>
            )}
            {!success && !pending && (
              <Link
                href="/support"
                className="text-sm text-navy underline decoration-gold underline-offset-4"
              >
                Try again
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
