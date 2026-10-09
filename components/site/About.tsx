import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

export function About() {
  return (
    <section id="about" className="py-20 md:py-28">
      <Container className="flex flex-col gap-12 lg:flex-row lg:gap-20">
        <div className="lg:basis-5/12">
          <SectionHeading
            eyebrow="About the Foundation"
            title="Beneficial books, placed where they will be used."
          />
        </div>

        <div className="flex flex-col gap-6 text-lg leading-relaxed text-ink lg:basis-7/12 lg:border-l lg:border-rule lg:pl-16">
          <p>
            Good books can be costly, and they are not always within reach of a
            student or a small mosque. We raise funds, buy the books, and place
            them where they will be read and used.
          </p>
          <p>
            Supporters can give in two ways: to a campaign, or by paying for a
            specific book. Every distribution is recorded, so those who give can
            see what their contribution became.
          </p>
        </div>
      </Container>
    </section>
  );
}
