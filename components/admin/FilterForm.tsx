"use client";

import { usePathname, useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";

// A search form that changes the page address through the app, so the loader
// can see it. Without JavaScript it still works as a normal form.
export function FilterForm({
  action,
  role,
  className,
  children,
  method,
}: {
  action?: string;
  role?: string;
  className?: string;
  children: ReactNode;
  method?: "GET" | "POST";
}) {
  const router = useRouter();
  const pathname = usePathname();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    new FormData(e.currentTarget).forEach((value, key) => {
      const text = String(value).trim();
      if (text) params.set(key, text);
    });
    const base = action ?? pathname;
    const query = params.toString();
    router.push(query ? `${base}?${query}` : base);
  }

  return (
    <form action={action} role={role} onSubmit={onSubmit} className={className} method={method}>
      {children}
    </form>
  );
}
