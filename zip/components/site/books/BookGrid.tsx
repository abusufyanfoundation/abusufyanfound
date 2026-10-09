import type { Book } from "@/lib/types";
import { BookCard } from "./BookCard";

export function BookGrid({ books }: { books: Book[] }) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-14">
      {books.map((book) => (
        <div
          key={book.id}
          className="basis-full sm:basis-[calc((100%-2rem)/2)] lg:basis-[calc((100%-4rem)/3)]"
        >
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
}
