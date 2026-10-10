import type { Metadata } from "next";
import Link from "next/link";
import { TrackForm } from "@/components/forms/TrackForm";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { BiChevronLeft } from "react-icons/bi";

export const metadata: Metadata = {
  title: "Track your application",
  robots: { index: false, follow: false },
};

export default function TrackPage() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <Link
          href="/apply"
          className="flex items-center text-sm text-muted transition-colors hover:text-navy"
        >
          <BiChevronLeft className="text-2xl"/> Back to the application page
        </Link>

        <SectionHeading
          className="mt-8"
        //   eyebrow="Track"
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
