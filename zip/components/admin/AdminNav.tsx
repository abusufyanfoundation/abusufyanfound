"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Overview", href: "/admin" },
  { label: "Campaigns", href: "/admin/campaigns" },
  { label: "Books", href: "/admin/books" },
  { label: "Donations", href: "/admin/donations" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Beneficiaries", href: "/admin/beneficiaries" },
  { label: "Activity", href: "/admin/activity" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className="flex gap-1 overflow-x-auto px-4 pb-3 lg:flex-col lg:px-3 lg:pb-0"
    >
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-white/10 text-gold"
                : "text-white/75 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
