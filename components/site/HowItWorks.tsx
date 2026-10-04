import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const steps = [
  {
    title: "Books are selected",
    text: "The Foundation chooses the books needed for each batch.",
  },
  {
    title: "Supporters contribute",
    text: "Supporters give towards the cost of the books they choose.",
  },
  {
    title: "Books are acquired",
    text: "Once funds are received, the books and materials are purchased.",
  },
  {
    title: "Materials are distributed",
    text: "Books are handed to selected beneficiaries.",
  },
  {
    title: "Distribution is documented",
    text: "Each distribution is recorded, so giving can be accounted for.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-navy py-20 text-white md:py-28">
      <Container>
        <SectionHeading
          tone="dark"
          eyebrow="How it works"
          title="From selection to documented distribution"
        />

        <ol className="mt-14 flex flex-col gap-10 lg:flex-row lg:gap-8">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex-1 border-t border-gold/60 pt-6"
            >
              <span className="font-serif text-4xl text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-xl text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
