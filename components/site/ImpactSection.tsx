import { formatNaira } from "@/lib/money";
import type { ImpactStats } from "@/lib/types";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const count = (n: number | undefined) =>
  n === undefined ? "—" : n.toLocaleString("en-NG");

export function ImpactSection({ impact }: { impact: ImpactStats | null }) {
  const nothingYet =
    !impact ||
    (impact.campaign_funds_kobo === 0 &&
      impact.prefund_funds_kobo === 0 &&
      impact.books_distributed === 0);

  const stats = [
    { label: "Books distributed", value: count(impact?.books_distributed) },
    { label: "Students supported", value: count(impact?.students_supported) },
    { label: "Mosques supported", value: count(impact?.mosques_supported) },
    { label: "Completed batches", value: count(impact?.completed_batches) },
    {
      label: "Raised through campaigns",
      value: impact ? formatNaira(impact.campaign_funds_kobo) : "—",
    },
    {
      label: "Raised through book pre-funding",
      value: impact ? formatNaira(impact.prefund_funds_kobo) : "—",
    },
    { label: "Active campaigns", value: count(impact?.active_campaigns) },
  ];

  return (
    <section id="impact" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Impact"
          title="What your support has done"
          intro="These figures come directly from the Foundation's records, including past campaigns."
        />

        <dl className="mt-14 flex flex-wrap gap-x-8 gap-y-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex basis-40 flex-1 flex-col-reverse gap-2 border-l border-gold pl-6"
            >
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="font-display text-4xl text-navy md:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {nothingYet && (
          <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted">
            The Foundation is just beginning. These figures will update as
            campaigns are funded and distributions are recorded.
          </p>
        )}
      </Container>
    </section>
  );
}
