import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

export function About() {
  return (
    <section id="about" className="py-20 md:py-28">
      <Container className="flex flex-col gap-12 lg:flex-row lg:gap-20">
        <div className="lg:basis-5/12">
          <SectionHeading
            eyebrow="About the Foundation"
            title="Knowledge begins with the book in a student's hands."
          />
        </div>

        <div className="flex flex-col gap-6 text-lg leading-relaxed text-ink lg:basis-7/12 lg:border-l lg:border-rule lg:pl-16">
          <p>
            The Abu Sufyan Al-Alma&apos;iyy Foundation is a charitable Islamic
            initiative. We provide beneficial books and study materials to
            students of knowledge who would otherwise struggle to afford them.
          </p>
          <p>
            Supporters can make a general donation or choose specific books to
            fund. We place the books with students and record every batch, so
            those who give can see what their contribution became.
          </p>
          <p>
            Helping a student of knowledge is a good that continues for as long
            as the book is used. We want that giving to be simple, open and
            trustworthy.
          </p>
        </div>
      </Container>
    </section>
  );
}
