import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-paper lg:flex-row">
      <aside className="bg-navy-deep text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center justify-between px-6 py-4 lg:block lg:py-8">
            <Link
              href="/admin"
              aria-label="Admin overview"
              className="inline-block bg-paper p-1.5"
            >
              <Image
                src="/logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-auto"
              />
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
          <AdminNav />
        </div>

        <div className="hidden px-6 py-6 lg:block">
          {profile?.full_name && (
            <p className="mb-3 text-sm text-white/60">{profile.full_name}</p>
          )}
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
