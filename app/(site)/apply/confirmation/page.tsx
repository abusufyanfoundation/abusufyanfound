import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Submitted",
  robots: { index: false, follow: false },
};

export default async function ApplyConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  const valid =
    reference && /^(APP|REQ)-[A-Z0-9]{8}$/.test(reference) ? reference : null;
  const isRequest = valid?.startsWith("REQ-");

  return (
    <section className="py-16 md:py-28">
      <Container>
        <div className="max-w-2xl">
          {/* <p className="text-xs tracking-[0.18em] text-gold-deep uppercase sm:text-sm">
            {isRequest ? "Request received" : "Application received"}
          </p> */}

          <h1 className="mt-4 text-3xl md:text-5xl">
            We have received your {isRequest ? "request" : "application"}.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            The Foundation will review it and get in touch if it needs anything
            more. Please keep your reference code safe. You will need it, with your
            phone number, to check the status.
          </p>

          {valid && (
            <div className="mt-10 border-l-2 border-gold pl-6">
              <p className="text-sm text-muted">Your reference code</p>
              <p className="mt-1 font-display text-3xl text-navy">{valid}</p>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <ButtonLink href="/apply/track">Track your application</ButtonLink>
            <ButtonLink href="/" variant="outline">
              Back to the website
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
