import Link from "next/link";

type Variant = "primary" | "gold" | "outline" | "outline-light";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-deep",
  gold: "bg-gold text-navy-deep hover:brightness-95",
  outline: "border border-navy text-navy hover:bg-navy hover:text-white",
  "outline-light":
    "border border-white/40 text-white hover:border-gold hover:text-gold",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-sm px-6 py-3.5 text-sm font-medium tracking-wide transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
