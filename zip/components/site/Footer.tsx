import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { siteConfig } from "@/lib/site";
import { Container } from "./Container";

export function Footer() {
  const { contact } = siteConfig;
  const hasContact = contact.email || contact.phone || contact.address;

  return (
    <footer className="bg-navy-deep text-white">
      <Container className="flex flex-col gap-14 py-16 lg:flex-row lg:justify-between">
        <div className="max-w-sm">
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
              className="hidden max-w-56 font-display text-lg font-normal leading-tight text-white sm:block"
            >
              {siteConfig.name}
            </span>
          </Link>
          <p className="mt-6 text-sm leading-relaxed text-white/80">
            {siteConfig.description}
          </p>
          <ButtonLink
            href={siteConfig.cta.href}
            variant="gold"
            className="mt-8"
          >
            Support the Foundation
          </ButtonLink>
        </div>

        <div className="flex flex-col gap-12 sm:flex-row sm:gap-20">
          <nav aria-label="Footer">
            <h2 className="text-sm tracking-[0.18em] text-gold uppercase">
              Explore
            </h2>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/80 transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm tracking-[0.18em] text-gold uppercase">
              {hasContact ? "Contact" : "Follow"}
            </h2>

            {hasContact && (
              <ul className="mt-5 flex flex-col gap-3 text-sm text-white/80">
                {contact.email && (
                  <li>
                    <a
                      href={`mailto:${contact.email}`}
                      className="transition-colors hover:text-gold"
                    >
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.phone && (
                  <li>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="transition-colors hover:text-gold"
                    >
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.address && <li>{contact.address}</li>}
              </ul>
            )}

            {hasContact && (
              <h2 className="mt-10 text-sm tracking-[0.18em] text-gold uppercase">
                Follow
              </h2>
            )}
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {siteConfig.social.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 transition-colors hover:text-gold"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/15">
        <Container className="py-6 text-xs text-white/55">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
