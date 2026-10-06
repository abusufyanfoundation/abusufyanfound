"use client";

import Image from "next/image";
import { useState } from "react";
import { formatNaira } from "@/lib/money";
import type { Book } from "@/lib/types";
import { useSelection } from "@/components/site/selection/SelectionProvider";

export function BookCard({ book }: { book: Book }) {
  const { items, setItem, removeItem } = useSelection();
  const selected = items[book.id];

  const [draft, setDraft] = useState<number>();
  const qty = draft ?? selected?.quantity ?? 1;

  const max = book.available_quantity;
  const soldOut = max < 1;
  const unchanged = selected?.quantity === qty;

  const change = (n: number) => setDraft(Math.min(max, Math.max(1, n)));

  const confirm = () => {
    setItem({
      bookId: book.id,
      title: book.title,
      priceKobo: book.price_kobo,
      quantity: qty,
      max,
    });
    setDraft(undefined);
  };

  const buttonLabel = !selected
    ? "Add to selection"
    : unchanged
      ? "Selected"
      : "Update quantity";

  return (
    <article className="flex flex-col">
      <div className="relative aspect-[3/4] w-full bg-gold-soft">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-navy p-8 text-center">
            <span className="font-display text-2xl leading-snug text-white">
              {book.title}
            </span>
          </div>
        )}
      </div>

      <h3 className="mt-5 font-display text-2xl leading-snug text-navy">
        {book.title}
      </h3>
      <p className="mt-1 text-sm text-muted">{book.author}</p>

      {book.description && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink">
          {book.description}
        </p>
      )}

      <div className="mt-4 flex items-baseline justify-between border-t border-rule pt-4">
        <p className="font-display text-xl text-navy">
          {formatNaira(book.price_kobo)}
        </p>
        <p className="text-sm text-muted">
          {soldOut ? "Out of stock" : `${max} available`}
        </p>
      </div>

      {!soldOut && (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center border border-rule bg-white">
            <button
              type="button"
              onClick={() => change(qty - 1)}
              disabled={qty <= 1}
              aria-label={`Decrease quantity of ${book.title}`}
              className="px-3.5 py-2.5 text-lg text-navy disabled:opacity-30"
            >
              −
            </button>
            <span
              aria-live="polite"
              className="min-w-8 text-center text-sm font-medium text-ink"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => change(qty + 1)}
              disabled={qty >= max}
              aria-label={`Increase quantity of ${book.title}`}
              className="px-3.5 py-2.5 text-lg text-navy disabled:opacity-30"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={confirm}
            disabled={unchanged}
            className="flex-1 rounded-sm bg-navy px-4 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-navy-deep disabled:bg-gold-soft disabled:text-navy"
          >
            {buttonLabel}
          </button>
        </div>
      )}

      {selected && (
        <button
          type="button"
          onClick={() => {
            removeItem(book.id);
            setDraft(undefined);
          }}
          className="mt-3 self-start text-sm text-muted underline underline-offset-4 hover:text-navy"
        >
          Remove from selection
        </button>
      )}
    </article>
  );
}
