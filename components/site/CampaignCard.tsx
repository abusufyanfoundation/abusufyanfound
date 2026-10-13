import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import { formatNaira } from "@/lib/money";
import { getSiteSettings } from "@/lib/data/settings";
import { campaignCaption, campaignUrl } from "@/lib/share";
import { ShareCampaign } from "./ShareButtons";
import type { CampaignWithStats } from "@/lib/types";

const second = "basis-full sm:basis-[calc((100%-1rem)/2)]";

export async function CampaignCard({
  campaign,
}: {
  campaign: CampaignWithStats;
}) {
  const { payments } = await getSiteSettings();
  const bank = payments.campaign.bank;
  const showBank =
    payments.campaign.transfer && bank.bank && bank.number && bank.name;

  const caption = campaignCaption(
    campaign.title,
    campaignUrl(campaign.slug),
    showBank ? bank : null,
  );

  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-stretch">
      {campaign.image_url && (
        <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:min-h-[24rem] lg:basis-5/12">
          <Image
            src={campaign.image_url}
            alt={campaign.title}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex w-full flex-1 flex-col border border-rule bg-white p-6 md:p-10">
        <h3 className="font-display text-3xl text-navy md:text-4xl">
          {campaign.title}
        </h3>

        {campaign.description && (
          <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-ink">
            {campaign.description}
          </p>
        )}

        <div className="mt-8">
          <ProgressBar
            raisedKobo={campaign.raised_kobo}
            targetKobo={campaign.target_kobo}
            animated
          />

          <StatGrid className="mt-6">
            <StatCard
              size="md"
              tone="paper"
              className={second}
              label="Raised"
              value={formatNaira(campaign.raised_kobo)}
            />
            <StatCard
              size="md"
              tone="paper"
              className={second}
              label="Target"
              value={formatNaira(campaign.target_kobo)}
            />
          </StatGrid>
        </div>

        <div className="mt-10">
          <ButtonLink href="/support">Donate to this campaign</ButtonLink>
        </div>

        <div className="mt-8 border-t border-rule pt-6">
          <ShareCampaign
            title={campaign.title}
            imageUrl={campaign.image_url}
            caption={caption}
          />
        </div>
      </div>
    </div>
  );
}
