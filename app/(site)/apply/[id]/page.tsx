import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getOpenBatch } from "@/lib/data/apply";
import { BiChevronLeft } from "react-icons/bi";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSiteSettings, PAUSED } from "@/lib/data/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Apply for this batch",
  robots: { index: false, follow: false },
};

export default async function ApplyBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch = await getOpenBatch(id);

  if (!batch) notFound();

  const { applications } = await getSiteSettings();

  return (
    <section className="py-16 md:py-24">
      <Container>
        <Link
          href="/apply"
          className=" flex items-center text-sm text-muted transition-colors hover:text-navy"
        >
          <BiChevronLeft className="text-2xl" /> Back
        </Link>

        <SectionHeading
          className="mt-8"
          title={batch.title}
          intro={batch.description ?? undefined}
        />

        <div className="mt-12 max-w-xl">
          {applications.paused ? (
            <EmptyState
              title="Applications are paused"
              text={applications.message || PAUSED.applications}
            />
          ) : (
            <ApplyForm
              batchId={batch.id}
              maxCopies={batch.max_copies_per_applicant}
              books={batch.batch_books}
              locations={batch.batch_locations}
            />
          )}
        </div>
      </Container>
    </section>
  );
}
