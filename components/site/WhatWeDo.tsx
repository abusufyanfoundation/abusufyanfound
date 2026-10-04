import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const activities = [
  {
    title: "Providing Islamic books",
    text: "We source beneficial Islamic books and make them available for supporters to fund.",
  },
  {
    title: "Supporting students of knowledge",
    text: "Students receive the materials they need to study, without carrying the cost themselves.",
  },
  {
    title: "Book distribution",
    text: "Funded books are delivered to selected beneficiaries, batch by batch.",
  },
  {
    title: "Fundraising campaigns",
    text: "Each campaign has a clear target, so supporters know what is being raised and why.",
  },
  {
    title: "Access to beneficial knowledge",
    text: "Our aim is that a lack of money should not stand between a student and a good book.",
  },
] as const;

export function WhatWeDo() {
  return (
    <section
      id="our-work"
      className="border-y border-rule bg-navy py-20 md:py-28"
    >
      <Container className="flex flex-col gap-12 lg:flex-row lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start lg:basis-4/12">
          <SectionHeading
            eyebrow="Our work"
            tone="dark"
            title="What the Foundation does"
            intro="Five parts of one purpose: getting good books to those who will use them."
          />
        </div>

        <ol className="lg:basis-8/12">
          {activities.map((item, i) => (
            <li
              key={item.title}
              className="flex gap-6 border-t border-rule py-8 first:border-t-0 first:pt-0 md:gap-10"
            >
              <span
                aria-hidden="true"
                className="w-12 shrink-0 font-serif text-3xl text-gold"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-serif text-2xl text-white">{item.title}</h3>
                <p className="mt-2 max-w-lg leading-relaxed text-white/80">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
