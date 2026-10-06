import Link from "next/link";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const ways = [
  {
    key: "campaign",
    label: "Campaigns",
    title: "Give to a campaign",
    text: "A campaign is a general fund with a target. You give any amount you can afford, but you do not choose the books that are bought.",
    facts: [
      { term: "Who chooses the books?", detail: "The Foundation" },
      {
        term: "When are the books are bought?",
        detail: "Once the campaign target is reached",
      },
      {
        term: "Who is it best for?",
        detail: " People who just want to donate to an ongoing campaign",
      },
    ],
    cta: { label: "See the current campaign", href: "/#campaign" },
  },
  {
    key: "prefund",
    label: "Book pre-fund",
    title: "Pre-fund a book",
    text: "Choose a particular book from our list and pay for exactly that. Some useful books are costly, and this lets you fund one directly.",
    facts: [
      { term: "Who chooses the books?", detail: "You" },
      {
        term: "When are the books are bought?",
        detail: "After your donation is received by the Foundation",
      },
      {
        term: "Who is it best for?",
        detail:
          " People who want to fund specific books, in one or more copies",
      },
    ],
    cta: { label: "Browse books to pre-fund", href: "/books" },
  },
] as const;

export function TwoWays() {
  return (
    <section id="ways-to-give" className="py-20 md:py-28 bg-gold-soft">
      <Container>
        <SectionHeading
          eyebrow="Ways to give"
          title="Two ways to give, and they are different"
          intro="You can support the Foundation through a campaign or by paying for a specific book. Here is how they differ."
        />

        <div className="mt-14 flex flex-col gap-14 lg:flex-row lg:gap-0">
          {ways.map((way, i) => (
            <article
              key={way.key}
              className={`flex flex-1 flex-col ${
                i === 1
                  ? "border-t border-rule pt-14 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0"
                  : "lg:pr-16"
              }`}
            >
              <p className="text-xs tracking-[0.18em] text-gold-deep uppercase sm:text-sm">
                {way.label}
              </p>
              <h3 className="mt-4 font-display text-3xl text-navy">
                {way.title}
              </h3>
              <p className="mt-4 max-w-md leading-relaxed text-ink">
                {way.text}
              </p>

              <dl className="mt-8 max-w-md">
                {way.facts.map((fact) => (
                  <div
                    key={fact.term}
                    className="flex flex-col gap-1 border-t border-rule py-4 sm:flex-row sm:justify-between sm:gap-6"
                  >
                    <dt className="text-sm text-muted">{fact.term}</dt>
                    <dd className="text-sm font-medium text-ink sm:max-w-[60%] sm:text-right">
                      {fact.detail}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8">
                <Link
                  href={way.cta.href}
                  className="text-navy underline decoration-gold underline-offset-4 hover:decoration-navy"
                >
                  {way.cta.label}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-14 max-w-2xl border-t border-rule pt-6 text-sm leading-relaxed text-muted">
          Either way, the books go to students of knowledge and mosques in need,
          and every distribution is recorded.
        </p>
      </Container>
    </section>
  );
}
