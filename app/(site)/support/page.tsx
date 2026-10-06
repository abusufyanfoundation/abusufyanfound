import type { Metadata } from "next";
import Link from "next/link";
import { BookCheckoutForm } from "@/components/forms/BookCheckoutForm";
import { GeneralDonationForm } from "@/components/forms/GeneralDonationForm";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getCurrentCampaign } from "@/lib/data/public";

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

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const books = type === "books";

  const campaign = await getCurrentCampaign();
  const campaignOpen = campaign !== null;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
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
                  the Foundation, and your gift will go towards its work of
                  providing books to students of knowledge and mosques.
                </p>
              </>
            )}

            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
              Payments are processed securely by Paystack. Your name is shown
              publicly only if you choose to display it.
            </p>
          </div>

          <div className="max-w-xl lg:basis-7/12">
            {books ? <BookCheckoutForm /> : <GeneralDonationForm />}
          </div>
        </div>
      </Container>
    </section>
  );
}
