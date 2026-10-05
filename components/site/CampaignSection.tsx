import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { formatNaira } from "@/lib/money";
import { siteConfig } from "@/lib/site";
import type { CampaignWithStats } from "@/lib/types";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(iso));

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-serif text-2xl text-navy">{value}</dd>
    </div>
  );
}

export function CampaignSection({
  campaign,
}: {
  campaign: CampaignWithStats | null;
}) {
  if (!campaign) {
    return (
      <section id="campaign" className="bg-gold-soft py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Campaigns"
            title="Our current campaign"
            intro="A campaign is a general fund with a target. Give any amount you like. You do not choose the books: once the target is reached, the Foundation chooses and buys them, and gives them to students of knowledge and mosques."
          />
          <div className="mt-10 max-w-xl border-l-2 border-gold pl-6">
            <p className="font-serif text-2xl text-navy">
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
        </Container>
      </section>
    );
  }

  const percent =
    campaign.target_kobo > 0
      ? Math.min(
          100,
          Math.round((campaign.raised_kobo / campaign.target_kobo) * 100),
        )
      : 0;
  const { closed } = campaign;

  return (
    <section id="campaign" className="bg-gold-soft py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow="Campaigns" title="Our current campaign" />

        <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:gap-16">
          {campaign.image_url && (
            <div className="relative aspect-[4/3] w-full lg:basis-5/12 lg:self-start">
              <Image
                src={campaign.image_url}
                alt={campaign.title}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="flex flex-1 flex-col">
            <h3 className="font-serif text-2xl text-navy md:text-2xl">
              {campaign.title}
            </h3>

            {campaign.description && (
              <p className="mt-4 max-w-xl whitespace-pre-line leading-relaxed text-ink">
                {campaign.description}
              </p>
            )}

            <div className="mt-8">
              <div
                role="progressbar"
                aria-label="Campaign progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="h-5 w-full overflow-hidden rounded-md border border-gold bg-white"
              >
                <div
                  className="animate-progress h-full bg-navy"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted">{percent}% of target</p>

              <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-5">
                <Figure
                  label="Raised"
                  value={formatNaira(campaign.raised_kobo)}
                />
                <Figure
                  label="Target"
                  value={formatNaira(campaign.target_kobo)}
                />
                <Figure
                  label="Supporters"
                  value={String(campaign.supporters)}
                />
                {campaign.deadline && (
                  <Figure
                    label={closed ? "Closed on" : "Closes on"}
                    value={formatDate(campaign.deadline)}
                  />
                )}
              </dl>
            </div>

            <div className="mt-10">
              {closed ? (
                <p className="text-sm text-muted">This campaign has closed.</p>
              ) : (
                <ButtonLink href="/support">Donate to this campaign</ButtonLink>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
