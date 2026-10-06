"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { useSelection } from "@/components/site/selection/SelectionProvider";
import { formatNaira } from "@/lib/money";

export function SelectionCard() {
  const { items, count, totalKobo, removeItem, clear } = useSelection();
  const list = Object.values(items);

  return (
    <article id="selection" className="flex h-full w-full flex-col">
      {/* Same footprint as a book cover */}
      <div className="flex aspect-[3/4] w-full grow flex-col bg-navy p-6 text-white">
        <p className="text-xs tracking-[0.18em] text-gold uppercase">
          Your selection
        </p>

        {list.length === 0 ? (
          <div className="mt-6">
            <p className="font-display text-2xl leading-snug text-white">
              Nothing selected yet.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Choose a book and press &ldquo;Add to selection&rdquo;. It will
              appear here.
            </p>
          </div>
        ) : (
          <ul className="mt-5 flex-1 divide-y divide-white/15 overflow-y-auto">
            {list.map((item) => (
              <li
                key={item.bookId}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-display text-lg leading-snug text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    {item.quantity} × {formatNaira(item.priceKobo)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.bookId)}
                  aria-label={`Remove ${item.title} from selection`}
                  className="shrink-0 text-xs text-white/70 underline underline-offset-4 hover:text-gold"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Total and actions sit at the bottom, level with the book cards' buttons */}
      <div className="mt-auto">
        <div className="mt-5 flex items-baseline justify-between border-t border-rule pt-4">
          <p className="font-display text-xl text-navy">
            {formatNaira(totalKobo)}
          </p>
          <p className="text-sm text-muted">
            {count} {count === 1 ? "book" : "books"}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          {count > 0 ? (
            <ButtonLink
              href="/support?type=books"
              className="flex-1 !px-4 !py-3"
            >
              Continue
            </ButtonLink>
          ) : (
            <span
              aria-disabled="true"
              className="flex-1 rounded-sm bg-gold-soft px-4 py-3 text-center text-sm font-medium text-navy/50"
            >
              Continue
            </span>
          )}

          {count > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-sm text-muted underline underline-offset-4 hover:text-navy"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
