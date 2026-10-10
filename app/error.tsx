"use client";

import { useEffect } from "react";
import { Container } from "@/components/site/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.18em] text-gold-deep uppercase sm:text-sm">
            Something went wrong
          </p>
          <h1 className="mt-4 text-3xl md:text-5xl">
            This page could not be shown.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            It is a problem on our side, not yours. Please try again. If it
            keeps happening, come back a little later.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-sm bg-navy px-6 py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-navy-deep"
            >
              Try again
            </button>
            <ButtonLink href="/" variant="outline">
              Back to the website
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
