"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { label: string; href: string; superOnly?: boolean };

const links: NavLink[] = [
  { label: "Overview", href: "/admin" },
  { label: "Campaigns", href: "/admin/campaigns" },
  { label: "Batches", href: "/admin/batches" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Beneficiaries", href: "/admin/beneficiaries" },
  { label: "Books", href: "/admin/books" },
  { label: "Book requests", href: "/admin/book-requests" },
  { label: "Donations", href: "/admin/donations" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Activity", href: "/admin/activity" },
  { label: "Team", href: "/admin/team", superOnly: true },
  { label: "Site settings", href: "/admin/settings", superOnly: true },
  { label: "My profile", href: "/admin/profile" },
];

export function AdminNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();
  const visible = links.filter((link) => !link.superOnly || isSuperAdmin);

  return (
    <nav
      aria-label="Admin"
      className="flex gap-1 overflow-x-auto px-4 pb-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:px-3 lg:pb-4 lg:[scrollbar-color:rgba(255,255,255,0.3)_transparent] lg:[scrollbar-width:thin]"
    >
      {visible.map((link) => {
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
