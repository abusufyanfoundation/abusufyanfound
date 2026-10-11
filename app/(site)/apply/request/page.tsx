import type { Metadata } from "next";
import { BookRequestForm } from "@/components/forms/BookRequestForm";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSiteSettings, PAUSED } from "@/lib/data/settings";
import { BackLink } from "@/components/ui/BackLink";

export const metadata: Metadata = {
  title: "Request a book",
  description:
    "Ask the Foundation for a book that is not on any batch list. Open to students, mosques and schools.",
  alternates: { canonical: "/apply/request" },
};

export default async function RequestBookPage() {
  const { applications } = await getSiteSettings();
  return (
    <section className="py-16 md:py-24">
      <Container>
        <BackLink href="/apply">Back to apply for books</BackLink>

        <SectionHeading
          as="h1"
          className="mt-8"
          title="Request a book"
          intro="Need a book that is not on any batch list? Tell us which one. The Foundation reviews every request and supplies what it can."
        />
        <div className="mt-12 max-w-xl">
          {applications.paused ? (
            <EmptyState
              title="Requests are paused"
              text={applications.message || PAUSED.applications}
            />
          ) : (
            <BookRequestForm />
          )}
        </div>
      </Container>
    </section>
  );
}
