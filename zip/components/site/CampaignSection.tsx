import { siteConfig } from "@/lib/site";
import type { CampaignWithStats } from "@/lib/types";
import { CampaignCard } from "./CampaignCard";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const INTRO =
  "A campaign is a general fund with a target. Give any amount you like. You do not choose the books: once the target is reached, the Foundation chooses and buys them, and gives them to students of knowledge and mosques.";

export function CampaignSection({
  campaign,
}: {
  campaign: CampaignWithStats | null;
}) {
  return (
    <section id="campaign" className="bg-gold-soft py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Campaigns"
          title="Our current campaign"
          intro={INTRO}
        />

        {campaign ? (
          <div className="mt-12">
            <CampaignCard campaign={campaign} />
          </div>
        ) : (
          <div className="mt-10 max-w-xl border-l-2 border-gold pl-6">
            <p className="font-display text-2xl text-navy">
              There is no active campaign right now.
            </p>
            <p className="mt-3 leading-relaxed text-muted">
              The next campaign will be announced here. You can follow the
              Foundation to hear about it first.
            </p>
            <ul className="mt-5 flex gap-6 text-sm">
              {siteConfig.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy underline decoration-gold underline-offset-4 hover:decoration-navy"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}
