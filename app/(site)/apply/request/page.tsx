import type { Metadata } from "next";
import Link from "next/link";
import { BookRequestForm } from "@/components/forms/BookRequestForm";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { BiChevronLeft } from "react-icons/bi";

export const metadata: Metadata = {
  title: "Request a book",
  description:
    "Ask the Foundation for a book that is not on any batch list. Open to students, mosques and schools.",
  alternates: { canonical: "/apply/request" },
};

export default function RequestBookPage() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <Link
          href="/apply"
          className="-mt-8 flex items-center text-sm text-muted transition-colors hover:text-navy"
        >
          <BiChevronLeft className="text-2xl" /> Apply for books
        </Link>

        <SectionHeading
          className=""
          title="Request a book"
          intro="Need a book that is not on any batch list? Tell us which one. The Foundation reviews every request and supplies what it can."
        />

        <div className="mt-12 max-w-xl">
          <BookRequestForm />
        </div>
      </Container>
    </section>
  );
}
