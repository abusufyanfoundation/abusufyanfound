import type { Book } from "@/lib/types";
import { BookCard } from "./books/BookCard";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { ButtonLink } from "../ui/ButtonLink";

export function BooksSection({
  books,
  hasCampaign,
}: {
  books: Book[];
  hasCampaign: boolean;
}) {
  return (
    <section id="books" className="py-20 pb-32 md:py-28 md:pb-36">
      <Container>
        <SectionHeading
          eyebrow="Pre-fund Books"
          title="Choose the books you would like to pay for"
          intro="Select a book and how many copies. You will review your selection and pay securely on the next step. The Foundation will then acquire the books and distribute them to the beneficiaries."
        />

        {books.length === 0 ? (
          <div className="mt-12 max-w-xl border-l-2 border-gold pl-6">
            <p className="font-serif text-2xl text-navy">
              {hasCampaign
                ? "No books are available at the moment."
                : "Books will be listed with the next campaign."}
            </p>
            <p className="mt-3 leading-relaxed text-muted">
              {hasCampaign
                ? "Every copy in this batch may already be taken. Please check back soon, or make a general donation instead."
                : "Once a campaign opens, the books for that batch will appear here."}
            </p>
          </div>
        ) : (
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-14">
            {books.map((book) => (
              <div
                key={book.id}
                className="basis-full sm:basis-[calc((100%-2rem)/2)] lg:basis-[calc((100%-4rem)/3)]"
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <ButtonLink href="/books" variant="gold">
           See more books you can pre-fund
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
