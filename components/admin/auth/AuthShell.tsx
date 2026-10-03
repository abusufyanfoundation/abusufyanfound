// import Image from "next/image";
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
        <Link href="/" aria-label="Back to the foundation website">
          {/* <Image
            src="/gold_bg.png"
            alt="Abu Sufyan Al-Alma'iyy Foundation"
            width={120}
            height={120}
            priority
          /> */}
          <h3 className="text-xl font-bold text-white!">Abu Sufyan Al-Alma&apos;iyy Foundation</h3>
        </Link>

        <div className="hidden md:block">
          <p className="font-serif text-3xl leading-snug text-white">
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
