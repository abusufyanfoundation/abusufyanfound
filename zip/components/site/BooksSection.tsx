import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const points = [
  {
    term: "You choose",
    text: "Browse the books we have listed and pick the ones you would like to fund.",
  },
  {
    term: "You pay",
    text: "Pay the price of the book securely online. You can fund more than one copy.",
  },
  {
    term: "We deliver",
    text: "The Foundation buys the books and gives them to students and mosques in need, and records each distribution.",
  },
] as const;

export function BooksSection() {
  return (
    <section id="books" className="py-20 md:py-28">
      <Container className="flex flex-col gap-12 lg:flex-row lg:gap-20">
        <div className="lg:basis-1/2">
          <SectionHeading
            eyebrow="Pre-fund a book"
            title="Give a student or a mosque the book they need"
            intro="Some of the most useful books are also the most expensive. Choose one from our list and pay for it. The Foundation buys it and gives it to a student of knowledge or a mosque in need."
          />

          <div className="mt-10">
            <ButtonLink href="/books">Browse books to pre-fund</ButtonLink>
          </div>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
            Prefer to give without choosing a book?{" "}
            <Link
              href="/#campaign"
              className="text-navy underline decoration-gold underline-offset-4 hover:decoration-navy"
            >
              Support the current campaign.
            </Link>
          </p>
        </div>

        <dl className="lg:basis-1/2 lg:border-l lg:border-rule lg:pl-16">
          {points.map((point) => (
            <div
              key={point.term}
              className="border-t border-rule py-7 first:border-t-0 first:pt-0"
            >
              <dt className="font-display text-2xl text-navy">{point.term}</dt>
              <dd className="mt-2 max-w-md leading-relaxed text-muted">
                {point.text}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
