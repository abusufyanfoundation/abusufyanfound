import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const steps = [
  {
    title: "You give",
    text: "Give to a campaign, or pay for a specific book. Both are paid securely online.",
  },
  {
    title: "The Foundation buys the books",
    text: "For a campaign, once the target is reached. For a pre-funded book, after your payment is confirmed.",
  },
  {
    title: "Books are distributed",
    text: "They go to students of knowledge and mosques in need.",
  },
  {
    title: "Distribution is recorded",
    text: "Each distribution is documented, so giving can be accounted for.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-navy py-20 text-white md:py-28">
      <Container>
        <SectionHeading
          tone="dark"
          eyebrow="How it works"
          title="What happens after you give"
        />

        <ol className="mt-14 flex flex-col gap-10 lg:flex-row lg:gap-8">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex-1 border-t border-gold/60 pt-6"
            >
              <span className="font-display text-4xl text-gold">
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
