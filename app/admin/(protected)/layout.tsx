import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getSiteSettings } from "@/lib/data/settings";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isSuperAdmin } = await requireAdmin();
  const { site } = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-paper lg:flex-row">
      <aside className="bg-navy-deep text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <div className="flex shrink-0 items-center justify-between px-6 py-4 lg:block lg:py-8">
            <Link
              href="/admin"
              aria-label="Admin overview"
              className="flex items-center gap-3"
            >
              <Image
                src="/logo.png"
                alt=""
                width={48}
                height={48}
                priority
                className="h-12 w-auto rounded-sm"
              />
              <span
                aria-hidden="true"
                className="max-w-56 font-display text-lg font-normal leading-tight text-white sm:block"
              >
                {site.name}
              </span>
            </Link>
            <form action={signOut} className="lg:hidden">
              <button
                type="submit"
                className="text-sm text-white/70 underline underline-offset-4"
              >
                Sign out
              </button>
            </form>
          </div>
          <AdminNav isSuperAdmin={isSuperAdmin} />
        </div>

        <div className="hidden shrink-0 border-t border-white/10 px-6 py-6 lg:block">
          {profile.full_name && (
            <p className="text-sm text-white/60">{profile.full_name}</p>
          )}
          <p className="mb-3 text-xs text-white/40">
            {isSuperAdmin ? "Super admin" : "Administrator"}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-white/80 underline underline-offset-4 hover:text-gold"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-3 block text-sm text-white/60 hover:text-gold"
          >
            View website
          </Link>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
