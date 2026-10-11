import type { Metadata } from "next";
import { TrackForm } from "@/components/forms/TrackForm";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { BackLink } from "@/components/ui/BackLink";

export const metadata: Metadata = {
  title: "Track your application",
  robots: { index: false, follow: false },
};

export default function TrackPage() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <BackLink href="/apply">Back to apply for books</BackLink>

        <SectionHeading
          as="h1"
          className="mt-8"
          title="Track your application or request"
          intro="Enter the reference you were given and the phone number you used."
        />

        <div className="mt-12 max-w-xl">
          <TrackForm />
        </div>
      </Container>
    </section>
  );
}
