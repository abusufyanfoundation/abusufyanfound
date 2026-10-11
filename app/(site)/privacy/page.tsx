import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "How the Foundation collects, uses and protects the personal information people give us.",
  alternates: { canonical: "/privacy" },
};

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl text-navy">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-ink">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  const email = siteConfig.contact.email;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          as="h1"
          title="Privacy notice"
          intro={`How the ${siteConfig.name} uses the personal information you give us. Last updated 11 October 2026.`}
        />

        <div className="max-w-2xl">
          <Block title="Who we are">
            <p>
              The {siteConfig.name} is responsible for the information described
              here. You can reach us at{" "}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="text-navy underline decoration-gold underline-offset-4"
                >
                  {email}
                </a>
              ) : (
                "the contact details in the website footer"
              )}
              .
            </p>
          </Block>

          <Block title="What we collect">
            <ul className="list-disc pl-5">
              <li>
                When you apply for books or request a book: your name, phone
                number, email address, state, city and
                address, the book you chose, and how you want to receive it.
              </li>
              <li>
                For mosques and schools: the name, phone number and position of
                a reference person.
              </li>
              <li>
                When you give: your name, email address, phone number and the amount. Card details go straight to our payment processor.
                We never see or store them.
              </li>
            </ul>
          </Block>

          <Block title="Why we use it">
            <ul className="list-disc pl-5">
              <li>To review applications and confirm them with you.</li>
              <li>
                To contact your reference person to verify an application.
              </li>
              <li>To give out books and keep a record of who received them.</li>
              <li>To stop the same person applying twice for one batch.</li>
              <li>To process payments and contact donors about their gift.</li>
            </ul>
            {/* <p>
              The website shows only totals for the people we serve. A
              donor&apos;s name appears on the website only if they tick the box
              to display it.
            </p> */}
          </Block>

          <Block title="Reference people">
            <p>
              If you give us someone else&apos;s name and phone number as a
              reference, please tell them first. We use their details only to
              confirm your application.
            </p>
          </Block>

          <Block title="Children">
            <p>
              If you are under 18, a parent or guardian must apply for you or
              agree to the application. We may ask to speak to them before we
              hand over any books.
            </p>
          </Block>

          <Block title="Who can see it">
            <p>
              Only the Foundation&apos;s signed-in administrators can see
              applications and requests. We do not sell your information. We
              share it only if the law requires us to.
            </p>
          </Block>

          <Block title="How long we keep it">
            <p>
              We keep application and request records for as long as we need
              them to run the distribution and keep our own records. After that
              we delete or anonymise them.
            </p>
          </Block>

          <Block title="Your rights">
            <p>
              You can ask to see the information we hold about you, correct it,
              delete it, or object to how we use it. If you agreed to us using
              your information, you can withdraw that agreement at any time.
              Email us and we will respond. You also have the right to complain
              to the Nigeria Data Protection Commission.
            </p>
          </Block>
        </div>
      </Container>
    </section>
  );
}
