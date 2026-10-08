import { StatCard, StatGrid } from "@/components/ui/StatCard";
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
    { label: "Completed batches", value: count(impact?.completed_batches) },
    {
      label: "Raised through campaigns",
      value: impact ? formatNaira(impact.campaign_funds_kobo) : "—",
    },
    {
      label: "Raised through book pre-funding",
      value: impact ? formatNaira(impact.prefund_funds_kobo) : "—",
    },
    { label: "Books distributed", value: count(impact?.books_distributed) },
    { label: "Students supported", value: count(impact?.students_supported) },
    { label: "Mosques supported", value: count(impact?.mosques_supported) },
  //   { label: "Active campaigns", value: count(impact?.active_campaigns) },
  ];

  return (
    <section id="impact" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Impact"
          title="What your support has done"
          intro="These figures come directly from the Foundation's records, including past campaigns."
        />

        <StatGrid className="mt-14">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              size="lg"
              label={stat.label}
              value={stat.value}
            />
          ))}
        </StatGrid>

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
