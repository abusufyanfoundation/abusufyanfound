import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import { BiChevronLeft } from "react-icons/bi";

export { StatGrid };

export const th =
  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted";
export const td = "px-4 py-4 text-sm text-ink align-top";

export function PageHeader({
  title,
  intro,
  action,
  back,
}: {
  title: string;
  intro?: string;
  action?: { label: string; href: string };
  back?: { label: string; href: string };
}) {
  return (
    <div>
      {back && (
        <Link
          href={back.href}
          className="flex items-center mb-5 text-sm text-muted transition-colors hover:text-navy hover:scale-101"
        >
          <BiChevronLeft className="text-2xl" /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 border-b border-rule pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">{title}</h1>
          {intro && <p className="mt-2 max-w-xl text-sm text-muted">{intro}</p>}
        </div>
        {action && (
          <ButtonLink href={action.href} className="self-start sm:self-auto">
            {action.label}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-rule bg-white p-6 ${className}`}>
      {title && (
        <h2 className="mb-4 font-display text-xl text-navy">{title}</h2>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return <StatCard label={label} value={value} />;
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="border-l-2 border-gold pl-6">
      <p className="font-display text-2xl text-navy">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{text}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-block text-sm text-navy underline decoration-gold underline-offset-4"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-rule bg-white">
      <table className="w-full min-w-[40rem] border-collapse">{children}</table>
    </div>
  );
}

const tone: Record<string, string> = {
  Active: "font-medium text-navy",
  Listed: "font-medium text-navy",
  Paid: "font-medium text-navy",
  Completed: "font-medium text-gold-deep",
  Inactive: "text-muted",
  Draft: "text-muted",
  Hidden: "text-muted",
  Pending: "text-gold-deep",
};

export function StatusText({ status }: { status: string }) {
  return <span className={tone[status] ?? "text-muted"}>{status}</span>;
}

export function AdminPagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const link =
    "border border-navy px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-between"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={link}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={link}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
