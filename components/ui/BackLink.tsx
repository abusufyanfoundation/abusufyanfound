import Link from "next/link";
import { BiChevronLeft } from "react-icons/bi";

export function BackLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex w-fit items-center text-sm text-muted transition-colors hover:text-navy ${className}`}
    >
      <BiChevronLeft aria-hidden="true" className="text-2xl" />
      {children}
    </Link>
  );
}
