import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getSiteSettings } from "@/lib/data/settings";
import { siteConfig } from "@/lib/site";
import { Container } from "./Container";

export async function Hero() {
  const { site } = await getSiteSettings();

  return (
    <section className="overflow-hidden bg-navy text-white">
      <Container className="flex flex-col gap-12 py-14 md:gap-16 md:py-20 lg:flex-row lg:items-center lg:gap-16 lg:py-28">
        <div className="lg:basis-1/2">
          <h1 className="mt-8 max-w-2xl font-display text-4xl leading-[1.1] text-white md:text-6xl">
            Beneficial books for students of knowledge.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            {site.description}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href={siteConfig.cta.href} variant="gold">
              Support the Foundation
            </ButtonLink>
            <ButtonLink href="/books" variant="outline-light">
              Explore Books
            </ButtonLink>
          </div>
        </div>

        {/* Banner: below the text on small and medium, right column on large */}
        <div className="relative lg:basis-1/2">
          <Image
            src="/banner.png"
            alt={`${site.name} banner`}
            width={1200}
            height={800}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="relative h-auto w-full rounded-sm"
          />
        </div>
      </Container>
    </section>
  );
}
