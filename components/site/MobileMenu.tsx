"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { label: string; href: string };

export function MobileMenu({
  items,
  cta,
}: {
  items: readonly Item[];
  cta: Item;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="border border-navy px-4 py-2 text-sm font-medium text-navy"
      >
        {open ? "Close" : "Menu"}
      </button>

      <div
        id="mobile-menu"
        className={`absolute inset-x-0 top-full border-b border-rule bg-paper transition duration-200 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col px-6 pb-6 pt-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-rule py-4 font-serif text-xl text-navy"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={cta.href}
            onClick={() => setOpen(false)}
            className="mt-6 bg-navy px-6 py-4 text-center text-sm font-medium tracking-wide text-white"
          >
            {cta.label}
          </Link>
        </nav>
      </div>
    </div>
  );
}
