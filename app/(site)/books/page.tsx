import type { Metadata } from "next";
import Link from "next/link";
import { BookGrid } from "@/components/site/books/BookGrid";
import { BooksPagination } from "@/components/site/books/BooksPagination";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SelectionBar } from "@/components/site/selection/SelectionBar";
import { getBooksPage } from "@/lib/data/public";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Books you can pre-fund",
  description:
    "Choose a book and how many copies. The Foundation buys them and gives them to students of knowledge and mosques in need.",
  alternates: { canonical: "/books" },
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;

  const query = q?.trim().slice(0, 80) || undefined;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const { books, total } = await getBooksPage({
    q: query,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <section className="py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Pre-fund a book"
            title="Books you can pre-fund"
            intro="Choose a book and how many copies. The Foundation buys them and gives them to students of knowledge and mosques in need."
          />

          <form
            action="/books"
            role="search"
            className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="q" className="sr-only">
              Search by title or author
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by title or author"
              className="flex-1 border border-rule bg-white px-3.5 py-3 text-base text-ink transition-colors focus:border-navy"
            />
            <button
              type="submit"
              className="rounded-sm bg-navy px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-navy-deep"
            >
              Search
            </button>
          </form>

          {query && (
            <p className="mt-4 text-sm text-muted">
              {total} {total === 1 ? "result" : "results"} for &ldquo;{query}
              &rdquo;.{" "}
              <Link
                href="/books"
                className="text-navy underline decoration-gold underline-offset-4"
              >
                Clear search
              </Link>
            </p>
          )}

          {books.length === 0 ? (
            <div className="mt-14 max-w-xl border-l-2 border-gold pl-6">
              <p className="font-serif text-2xl text-navy">
                {query
                  ? "No books match your search."
                  : "No books are listed yet."}
              </p>
              <p className="mt-3 leading-relaxed text-muted">
                {query
                  ? "Try a different title or author, or clear the search to see every book."
                  : "Books you can pre-fund will appear here soon."}
              </p>
            </div>
          ) : (
            <div className="mt-14">
              <BookGrid books={books} />
              <BooksPagination page={page} totalPages={totalPages} q={query} />
            </div>
          )}
        </Container>
      </section>

      {/* Last child of <main>, so it pins to the screen bottom and rests above the footer */}
      <SelectionBar />
    </>
  );
}
