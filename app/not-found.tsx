import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <main id="main">
        <section className="py-20 md:py-28">
          <Container>
            <div className="max-w-2xl">
              <h1 className="mt-4 text-3xl md:text-5xl">
                We could not find that page
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                The link may be old or mistyped. You can go back to the
                homepage, or see how you can support the Foundation.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <ButtonLink href="/">Back to the website</ButtonLink>
                <ButtonLink href="/support" variant="outline">
                  Support the Foundation
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
