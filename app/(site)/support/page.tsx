import type { Metadata } from "next";
import Link from "next/link";
import { BookCheckoutForm } from "@/components/forms/BookCheckoutForm";
import { GeneralDonationForm } from "@/components/forms/GeneralDonationForm";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { BankDetailsCard } from "@/components/site/support/BankDetails";
import { getCurrentCampaign } from "@/lib/data/public";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSiteSettings, PAUSED } from "@/lib/data/settings";
import { BackLink } from "@/components/ui/BackLink";

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

const pill = (active: boolean) =>
  `border px-4 py-2 text-sm transition-colors ${
    active
      ? "border-navy bg-navy text-white"
      : "border-rule bg-white text-navy hover:border-navy"
  }`;

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; method?: string }>;
}) {
  const { type, method: requested } = await searchParams;
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

  const campaign = await getCurrentCampaign();
  const campaignOpen = campaign !== null;

  const group = books ? payments.books : payments.campaign;
  const both = group.online && group.transfer;
  const method: "paystack" | "transfer" =
    requested === "transfer" && group.transfer
      ? "transfer"
      : group.online
        ? "paystack"
        : "transfer";

  const base = books ? "/support?type=books" : "/support";
  const methodHref = (m: string) => `${base}${books ? "&" : "?"}method=${m}`;

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
            {campaignOpen ? "Give to the campaign" : "Give to the Foundation"}
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
                  {campaign.title}
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-ink">
                  You are giving to a campaign fund. You do not choose the
                  books: once the target is reached, the Foundation chooses and
                  buys them, and gives them to students of knowledge and
                  mosques.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-3xl text-navy">
                  Give to the Foundation
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-ink">
                  There is no open campaign at the moment. You can still give to
                  the Foundation, and your donation will go towards its work of
                  providing books to students of knowledge and mosques.
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
            {both && (
              <div
                className="mb-8 flex flex-wrap gap-2"
                aria-label="Payment method"
              >
                <Link
                  href={methodHref("paystack")}
                  className={pill(method === "paystack")}
                >
                  Pay online (Paystack)
                </Link>
                <Link
                  href={methodHref("transfer")}
                  className={pill(method === "transfer")}
                >
                  Bank transfer
                </Link>
              </div>
            )}

            {books ? (
              <BookCheckoutForm method={method} />
            ) : method === "paystack" ? (
              <GeneralDonationForm minAmount={donations.minNaira} />
            ) : (
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-2xl text-navy">
                  Give by bank transfer
                </h3>
                <BankDetailsCard bank={payments.campaign.bank} />
                <p className="text-xs leading-relaxed text-muted">
                  Please put your name in the transfer narration. Donations made by
                  transfer are added to the campaign total by the Foundation.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
