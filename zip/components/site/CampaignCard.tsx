import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import { formatNaira } from "@/lib/money";
import { campaignShareText, campaignUrl } from "@/lib/share";
import type { CampaignWithStats } from "@/lib/types";
import { ShareButtons } from "./ShareButtons";

const third = "basis-full sm:basis-[calc((100%-2rem)/3)]";

export function CampaignCard({ campaign }: { campaign: CampaignWithStats }) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
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

      {/* Details sit in a card, so the text never stretches across the full width */}
      <div
        className={`flex flex-1 flex-col border border-rule bg-white p-6 md:p-10 ${
          campaign.image_url ? "" : "max-w-3xl"
        }`}
      >
        <h3 className="font-display text-3xl text-navy md:text-4xl">
          {campaign.title}
        </h3>

        {campaign.description && (
          <p className="mt-4 max-w-xl whitespace-pre-line leading-relaxed text-ink">
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
              size="sm"
              tone="paper"
              className={third}
              label="Raised"
              value={formatNaira(campaign.raised_kobo)}
            />
            <StatCard
              size="sm"
              tone="paper"
              className={third}
              label="Target"
              value={formatNaira(campaign.target_kobo)}
            />
            <StatCard
              size="sm"
              tone="paper"
              className={third}
              label="Supporters"
              value={String(campaign.supporters)}
            />
          </StatGrid>
        </div>

        <div className="mt-10">
          <ButtonLink href="/support">Donate to this campaign</ButtonLink>
        </div>

        <div className="mt-8 border-t border-rule pt-6">
          <ShareButtons
            url={campaignUrl(campaign.slug)}
            title={campaign.title}
            text={campaignShareText(campaign.title)}
          />
        </div>
      </div>
    </div>
  );
}
