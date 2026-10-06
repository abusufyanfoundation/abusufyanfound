export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "light",
  className = "",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <span className="h-px w-10 bg-gold" />
        <p
          className={`text-xs tracking-[0.18em] uppercase sm:text-sm ${
            dark ? "text-gold" : "text-gold-deep"
          }`}
        >
          {eyebrow}
        </p>
      </div>
      <h2
        className={`mt-5 font-display text-3xl leading-tight md:text-4xl ${
          dark ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-4 max-w-xl leading-relaxed ${
            dark ? "text-white/80" : "text-muted"
          }`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
