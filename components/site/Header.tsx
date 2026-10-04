import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { siteConfig } from "@/lib/site";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label={siteConfig.name}
          className="flex items-center gap-3"
        >
          <Image
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            priority
            className="h-12 w-auto rounded-sm"
          />
          <span
            aria-hidden="true"
            className="hidden max-w-[14rem] font-serif text-lg font-semibold leading-tight text-navy sm:block"
          >
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink transition-colors hover:text-navy hover:underline hover:decoration-gold hover:underline-offset-8"
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink href={siteConfig.cta.href} className="!py-2.5">
            {siteConfig.cta.label}
          </ButtonLink>
        </nav>

        <MobileMenu items={siteConfig.nav} cta={siteConfig.cta} />
      </Container>
    </header>
  );
}
