import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getOpenBatches } from "@/lib/data/apply";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply for books",
  description:
    "Students of knowledge, mosques and schools can apply for books the Foundation has bought with its campaign funds.",
  alternates: { canonical: "/apply" },
};

const link = "text-navy underline decoration-gold underline-offset-4";

export default async function ApplyPage() {
  const batches = await getOpenBatches();

  return (
    <section className="py-16 md:py-24 ">
      <Container>
        <SectionHeading
        className="-mt-8"
          title="Apply for books"
          intro="When a campaign is completed, the Foundation buys the books and gives them to students of knowledge, mosques and schools. Choose an open batch below to apply."
        />

        {batches.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="No batch is open for applications right now."
              text=" New batches open when a campaign is completed. You can still ask for a book that is not on a list, or check an earlier application."
            />
          </div>
        ) : (
          <ul className="mt-14 flex flex-col gap-6">
            {batches.map((batch) => (
              <li
                key={batch.id}
                className="border border-rule bg-white p-6 md:p-8"
              >
                <h2 className="font-display text-2xl text-navy">
                  {batch.title}
                </h2>
                {batch.description && (
                  <p className="mt-3 max-w-2xl leading-relaxed text-ink">
                    {batch.description}
                  </p>
                )}
                <p className="mt-4 text-sm text-muted">
                  {batch.batch_books.length}{" "}
                  {batch.batch_books.length === 1 ? "book" : "books"} in this
                  batch
                  {batch.closes_at && (
                    <> · applications close {formatDate(batch.closes_at)}</>
                  )}
                </p>
                <p className="mt-1 text-sm text-muted">
                 Note:  Individuals and mosques can request a maximum of 1 copy of a book. Schools
                  can request up to {batch.max_copies_per_applicant}.
                </p>
                <div className="mt-6">
                  <ButtonLink href={`/apply/${batch.id}`}>
                    Apply for this batch
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* <div className="mt-14 max-w-xl flex min-h-28 flex-col justify-between gap-3 border border-rule border-t-2 border-t-gold p-5"> */}
         {/* <h2 className="text-2xl"> Other options</h2> */}
        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link href="/apply/request" className={link}>
            Request a book that is not on the list
          </Link>
          <Link href="/apply/track" className={link}>
            Track your application or request
          </Link>
        </div>
      </Container>
    </section>
  );
}
