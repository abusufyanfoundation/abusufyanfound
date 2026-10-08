import { siteConfig } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";

export function AuthShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col justify-between bg-navy px-8 py-8 md:w-5/12 md:px-14 md:py-16">
        <Link
          href="/"
          aria-label="Back to foundation homepage"
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
            {siteConfig.name}
          </span>
        </Link>

        <div className="hidden md:block">
          <p className="font-display text-3xl leading-snug text-white">
            Foundation administration
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Manage campaigns, books, donations and distribution records.
          </p>
        </div>

        <span className="hidden h-px w-16 bg-gold md:block" />
      </aside>

      <section className="flex flex-1 items-center bg-paper px-6 py-12 md:px-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{intro}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
