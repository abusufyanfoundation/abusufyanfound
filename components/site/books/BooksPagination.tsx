import Link from "next/link";

export function BooksPagination({
  page,
  totalPages,
  q,
}: {
  page: number;
  totalPages: number;
  q?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/books?${qs}` : "/books";
  };

  const linkClass =
    "border border-navy px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex items-center justify-between border-t border-rule pt-6"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass}>
          Previous
        </Link>
      ) : (
        <span />
      )}

      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={linkClass}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
