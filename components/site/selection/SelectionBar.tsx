"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { formatNaira } from "@/lib/money";
import { useSelection } from "./SelectionProvider";

export function SelectionBar() {
  const { count, totalKobo, clear } = useSelection();
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/40 bg-navy-deep text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-10">
        <p className="text-sm">
          <span className="font-medium">
            {count} {count === 1 ? "book" : "books"} selected
          </span>
          <span className="text-white/70"> · {formatNaira(totalKobo)}</span>
        </p>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={clear}
            className="text-sm text-white/70 underline underline-offset-4 hover:text-gold"
          >
            Clear
          </button>
          <ButtonLink
            href="/support?type=books"
            variant="gold"
            className="!py-2.5"
          >
            Continue
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
