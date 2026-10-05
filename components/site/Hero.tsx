import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { siteConfig } from "@/lib/site";
import { Container } from "./Container";

export function Hero() {
  return (
    <section className="overflow-hidden bg-navy text-white">
      <Container className="flex flex-col gap-12 py-14 md:gap-16 md:py-20 lg:flex-row lg:items-center lg:gap-16 lg:py-28">
        <div className="lg:basis-1/2">
          {/* <div className="flex items-center gap-4">
            <p className="text-xs tracking-[0.18em] text-gold font-bold uppercase sm:text-sm">
              {siteConfig.name}
            </p>
          </div> */}

          <h1 className="mt-8 max-w-2xl font-serif text-4xl leading-[1.1] text-white md:text-6xl">
            Beneficial books for students of knowledge.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            The Abu Sufyan Al-Alma&apos;iyy Foundation is a non-profit
            organization dedicated to the donation of the noble Qur&apos;an and beneficial books to
            students of knowledge and to mosques, with a focus on Islamic sciences and related
            subjects.
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
            alt={`${siteConfig.name} banner`}
            width={1200}
            height={800}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="relative h-auto w-full rounded-2xl"
          />
        </div>
      </Container>
    </section>
  );
}
