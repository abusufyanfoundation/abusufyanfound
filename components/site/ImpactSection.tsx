import { formatNaira } from "@/lib/money";
import type { ImpactStats } from "@/lib/types";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

export function ImpactSection({ impact }: { impact: ImpactStats | null }) {
  const nothingYet =
    !impact ||
    (impact.funds_raised_kobo === 0 && impact.books_distributed === 0);

  const stats = [
    {
      label: "Books distributed",
      value: impact ? impact.books_distributed.toLocaleString("en-NG") : "—",
    },
    {
      label: "Students supported",
      value: impact ? impact.students_supported.toLocaleString("en-NG") : "—",
    },
    {
      label: "Completed batches",
      value: impact ? impact.completed_batches.toLocaleString("en-NG") : "—",
    },
    {
      label: "Funds raised",
      value: impact ? formatNaira(impact.funds_raised_kobo) : "—",
    },
    {
      label: "Active campaigns",
      value: impact ? impact.active_campaigns.toLocaleString("en-NG") : "—",
    },
  ];

  return (
    <section id="impact" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Impact"
          title="What your support has done"
          intro="These figures come directly from the Foundation's records."
        />

        <dl className="mt-14 flex flex-wrap gap-x-8 gap-y-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex basis-40 flex-1 flex-col-reverse gap-2 border-l border-gold pl-6"
            >
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="font-serif text-4xl text-navy md:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {nothingYet && (
          <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted">
           Figures will appear here once data is available.
          </p>
        )}
      </Container>
    </section>
  );
}
