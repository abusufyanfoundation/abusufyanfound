import Link from "next/link";

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
