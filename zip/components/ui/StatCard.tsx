const gridSlot =
  "basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)]";

export function StatGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <dl className={`flex flex-wrap gap-4 ${className}`}>{children}</dl>;
}

export function StatCard({
  label,
  value,
  size = "md",
  tone = "white",
  className = gridSlot,
}: {
  label: string;
  value: string;
  size?: "sm" | "md" | "lg";
  tone?: "white" | "paper";
  className?: string;
}) {
  const sizes = { sm: "text-2xl", md: "text-3xl", lg: "text-4xl" } as const;

  return (
    <div
      className={`flex min-h-28 flex-col-reverse justify-between gap-3 border border-rule border-t-2 border-t-gold p-5 ${
        tone === "paper" ? "bg-paper" : "bg-white"
      } ${className}`}
    >
      <dt className="text-sm leading-snug text-muted">{label}</dt>
      <dd className={`font-display text-navy ${sizes[size]}`}>{value}</dd>
    </div>
  );
}
