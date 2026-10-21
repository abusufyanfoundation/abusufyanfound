import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BookCheckoutForm } from "@/components/forms/BookCheckoutForm";
import { GeneralDonationForm } from "@/components/forms/GeneralDonationForm";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { BankDetailsCard } from "@/components/site/support/BankDetails";
import { getActiveCampaigns } from "@/lib/data/public";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getSiteSettings, PAUSED } from "@/lib/data/settings";
import { BackLink } from "@/components/ui/BackLink";
import { formatNaira } from "@/lib/money";

export const metadata: Metadata = {
  title: "Support the Foundation",
  description:
    "Give to a campaign or pay for specific books. The Foundation gives the books to students of knowledge and mosques in need.",
  alternates: { canonical: "/support" },
};

const tab = (active: boolean) =>
  `border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
    active
      ? "border-gold text-navy"
      : "border-transparent text-muted hover:text-navy"
  }`;

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        selected ? "border-navy bg-navy" : "border-rule bg-white"
      }`}
    >
      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
    </span>
  );
}

function ChoiceCard({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={selected ? "true" : undefined}
      className={`flex gap-4 border p-5 transition-colors ${
        selected
          ? "border-navy bg-paper"
          : "border-rule bg-white hover:border-navy"
      }`}
    >
      <Radio selected={selected} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">{children}</div>
    </Link>
  );
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; method?: string; to?: string }>;
}) {
  const { type, method: requested, to } = await searchParams;
  const books = type === "books";

  const { donations, payments } = await getSiteSettings();

  if (donations.paused) {
    return (
      <section className="py-16 md:py-24">
        <Container>
          <BackLink href="/" className="mb-8">
            Back to the website
          </BackLink>
          <SectionHeading
            as="h1"
            eyebrow="Support us"
            title="Support the Foundation"
          />
          <div className="mt-12">
            <EmptyState
              title="Giving is paused for now"
              text={donations.message || PAUSED.donations}
            />
          </div>
        </Container>
      </section>
    );
  }

  const active = await getActiveCampaigns();
  const open = active.filter((c) => c.collecting);

  // The general campaign is preselected while it runs, then the batch campaign
  const campaign =
    to === "foundation"
      ? null
      : (open.find((c) => c.slug === to) ??
        open.find((c) => c.kind === "general") ??
        open[0] ??
        null);
  const campaignOpen = campaign !== null;
  const showWhere = !books && open.length > 0;
  const waiting =
    active.find((c) => c.kind === "batch" && !c.collecting) ?? null;
  const chosen = campaign?.slug ?? "foundation";
  const group = books ? payments.books : payments.campaign;
  const both = group.online && group.transfer;
  const method: "paystack" | "transfer" =
    requested === "transfer" && group.transfer
      ? "transfer"
      : group.online
        ? "paystack"
        : "transfer";

  const methodHref = (m: string) =>
    books
      ? `/support?type=books&method=${m}`
      : `/support?to=${chosen}&method=${m}`;
  const giveHref = (slug: string) =>
    `/support?to=${slug}${method === "transfer" ? "&method=transfer" : ""}`;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Support us"
          title="Support the Foundation"
          intro="Give to a campaign, or pay for specific books. Either way, the books go to students of knowledge and mosques in need."
        />

        <nav
          aria-label="Ways to give"
          className="mt-10 flex gap-8 border-b border-rule"
        >
          <Link
            href="/support"
            className={tab(!books)}
            aria-current={!books ? "page" : undefined}
          >
            {open.length > 0 ? "Give to a campaign" : "Give to the Foundation"}
          </Link>
          <Link
            href="/support?type=books"
            className={tab(books)}
            aria-current={books ? "page" : undefined}
          >
            Pay for books
          </Link>
        </nav>

        <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:gap-20">
          <div className="lg:basis-5/12">
            {books ? (
              <>
                <h2 className="font-display text-3xl text-navy">
                  Pre-fund specific books
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-ink">
                  You are paying for the books you chose. The Foundation will
                  buy exactly these and give them to students of knowledge and
                  mosques in need.
                </p>
              </>
            ) : campaignOpen ? (
              <>
                <h2 className="font-display text-3xl text-navy">
                  Give to a campaign
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-ink">
                  You are giving to a campaign fund. You do not choose the
                  books: once the target is reached, the Foundation chooses and
                  buys them, and gives them to students of knowledge and
                  mosques.
                </p>
              </>
            ) : open.length > 0 ? (
              <>
                <h2 className="font-display text-3xl text-navy">
                  Give to the Foundation
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-ink">
                  Your gift goes to the Foundation&apos;s general work of
                  providing books to students of knowledge and mosques. It is
                  not tied to a campaign.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-3xl text-navy">
                  Give to the Foundation
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-ink">
                  {waiting
                    ? `The next batch of “${waiting.title}” opens soon. `
                    : "There is no open campaign at the moment. "}
                  You can still give to the Foundation, and your donation will
                  go towards its work of providing books to students of
                  knowledge and mosques.
                </p>
              </>
            )}

            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
              {method === "paystack"
                ? "Payments are processed securely by Paystack."
                : books
                  ? "Your order is saved first, then you transfer to the account shown. We confirm it when the money arrives."
                  : "Transfer any amount to the Foundation account."}
            </p>
          </div>

          <div className="max-w-xl lg:basis-7/12">
            {showWhere && (
              <section
                aria-labelledby="where-heading"
                className="mb-10 flex flex-col gap-3"
              >
                <h2 id="where-heading" className="text-sm font-medium text-ink">
                  <span className="text-muted">Step 1. </span>
                  Where should your gift go?
                </h2>
                <ul className="flex flex-col gap-3">
                  {open.map((c) => (
                    <li key={c.id}>
                      <ChoiceCard
                        href={giveHref(c.slug)}
                        selected={campaign?.id === c.id}
                      >
                        <p className="text-xs font-medium uppercase tracking-wider text-gold-deep">
                          {c.batch
                            ? `Batch ${c.batch.number}: ${c.batch.title}`
                            : "General campaign"}
                        </p>
                        <p className="font-display text-xl text-navy">
                          {c.title}
                        </p>
                        {c.description && (
                          <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                            {c.description}
                          </p>
                        )}
                        <div className="mt-1">
                          <ProgressBar
                            raisedKobo={c.raised_kobo}
                            targetKobo={c.target_kobo}
                          />
                        </div>
                        <p className="text-xs text-muted">
                          {formatNaira(c.raised_kobo)} raised of{" "}
                          {formatNaira(c.target_kobo)}
                        </p>
                      </ChoiceCard>
                    </li>
                  ))}
                  <li>
                    <ChoiceCard
                      href={giveHref("foundation")}
                      selected={campaign === null}
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-gold-deep">
                        The Foundation
                      </p>
                      <p className="font-display text-xl text-navy">
                        The Foundation in general
                      </p>
                      <p className="text-sm leading-relaxed text-muted">
                        Supports the Foundation&apos;s day-to-day work of
                        providing books to students of knowledge and mosques.
                        Not tied to a campaign or a target.
                      </p>
                    </ChoiceCard>
                  </li>
                </ul>
              </section>
            )}

            {both && (
              <section
                aria-labelledby="how-heading"
                className="mb-10 flex flex-col gap-3"
              >
                <h2 id="how-heading" className="text-sm font-medium text-ink">
                  {showWhere && <span className="text-muted">Step 2. </span>}
                  {books
                    ? "How would you like to pay?"
                    : "How would you like to give?"}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  <li>
                    <ChoiceCard
                      href={methodHref("paystack")}
                      selected={method === "paystack"}
                    >
                      <p className="font-display text-xl text-navy">
                        Pay online
                      </p>
                      <p className="text-sm leading-relaxed text-muted">
                        Pay with your card or bank account through Paystack.
                        Your payment is confirmed straight away.
                      </p>
                    </ChoiceCard>
                  </li>
                  <li>
                    <ChoiceCard
                      href={methodHref("transfer")}
                      selected={method === "transfer"}
                    >
                      <p className="font-display text-xl text-navy">
                        Bank transfer
                      </p>
                      <p className="text-sm leading-relaxed text-muted">
                        Send the money from your bank app to the
                        Foundation&apos;s account. We confirm it when the money
                        arrives.
                      </p>
                    </ChoiceCard>
                  </li>
                </ul>
              </section>
            )}

            {books ? (
              <BookCheckoutForm method={method} />
            ) : method === "paystack" ? (
              <GeneralDonationForm
                minAmount={donations.minNaira}
                target={campaign?.id ?? "foundation"}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-2xl text-navy">
                  Give by bank transfer
                </h3>
                <BankDetailsCard bank={payments.campaign.bank} />
                <p className="text-xs leading-relaxed text-muted">
                  {`Please put your name${
                    campaign
                      ? ` and “${campaign.batch ? `Batch ${campaign.batch.number}` : campaign.title}”`
                      : ""
                  } in the transfer narration. Gifts made by transfer are added to the total by the Foundation.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
