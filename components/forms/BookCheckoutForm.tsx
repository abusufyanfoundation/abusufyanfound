"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useActionForm } from "@/lib/forms/use-action-form";
import { startBookOrder } from "@/app/(site)/support/actions";
import { useSelection } from "@/components/site/selection/SelectionProvider";
import { formatNaira } from "@/lib/money";
import { DonorFields } from "./DonorFields";
import { Notice } from "./Notice";
import { SubmitButton } from "./SubmitButton";

const noopSubscribe = () => () => {};

// false while rendering on the server, true once running in the browser,
// so the saved selection is never mistaken for an empty one
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function BookCheckoutForm() {
  const hydrated = useHydrated();
  const { items, totalKobo, removeItem } = useSelection();
  const { state, pending, onSubmit } = useActionForm(startBookOrder);
  const list = Object.values(items);

  if (!hydrated) {
    return <p className="text-sm text-muted">Loading your selection…</p>;
  }

  if (list.length === 0) {
    return (
      <div className="border-l-2 border-gold pl-6">
        <p className="font-display text-2xl text-navy">
          You have not selected any books.
        </p>
        <p className="mt-3 leading-relaxed text-muted">
          Choose the books you would like to fund, then come back here to pay.
        </p>
        <Link
          href="/books"
          className="mt-5 inline-block text-navy underline decoration-gold underline-offset-4"
        >
          Browse books to pre-fund
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Notice error={state?.error} />

      <div>
        <ul className="divide-y divide-rule border-y border-rule">
          {list.map((item) => (
            <li
              key={item.bookId}
              className="flex items-start justify-between gap-4 py-4"
            >
              <div>
                <p className="font-display text-lg text-navy">{item.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {item.quantity} × {formatNaira(item.priceKobo)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.bookId)}
                  className="mt-2 text-xs text-muted underline underline-offset-4 hover:text-navy"
                >
                  Remove
                </button>
              </div>
              <p className="font-display text-lg text-navy">
                {formatNaira(item.priceKobo * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-baseline justify-between">
          <p className="text-sm text-muted">Total</p>
          <p className="font-display text-2xl text-navy">
            {formatNaira(totalKobo)}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            Prices and availability are checked again when you continue.
          </p>
          <Link
            href="/books"
            className="shrink-0 text-xs text-navy underline decoration-gold underline-offset-4"
          >
            Change selection
          </Link>
        </div>
      </div>

      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          list.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        )}
      />

      <DonorFields />

      <div className="flex flex-col items-start gap-3 pt-1">
        <SubmitButton pending={pending} pendingText="Preparing payment…">
          Continue to payment
        </SubmitButton>
        <p className="text-xs text-muted">
          You will be taken to Paystack to pay securely. We never see or store
          your card details.
        </p>
      </div>
    </form>
  );
}
