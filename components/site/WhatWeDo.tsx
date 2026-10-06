import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const activities = [
  {
    title: "Providing the noble Qur'an and beneficial books",
    text: "We provide the noble Qur'an and beneficial Islamic books, with a focus on the Islamic sciences.",
  },
  {
    title: "Supporting students of knowledge",
    text: "Students receive the books they need to study without carrying the cost themselves.",
  },
  {
    title: "Supporting mosques",
    text: "Books are also given to mosques, so their communities have something beneficial to learn from.",
  },
  {
    title: "Running campaigns",
    text: "A campaign is a general fund with a target. Supporters give any amount, and once the target is reached the Foundation chooses and buys the books for that batch.",
  },
  {
    title: "Book pre-funding",
    text: "Supporters can also choose a specific book from our list and pay for it. The Foundation buys it and gives it to someone in need.",
  },
  {
    title: "Recording every distribution",
    text: "Each distribution is documented, so those who give can see what their contribution became.",
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
            tone="dark"
            eyebrow="Our role"
            title="What the Foundation does"
            intro="One purpose: getting beneficial books to the students and mosques that will use them."
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
                className="w-12 shrink-0 font-display text-3xl text-gold"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-2xl text-white">
                  {item.title}
                </h3>
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
