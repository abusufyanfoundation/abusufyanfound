import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignCard } from "@/components/site/CampaignCard";
import { Container } from "@/components/site/Container";
import { getCampaignBySlug } from "@/lib/data/public";
import { campaignPath } from "@/lib/share";
import { BackLink } from "@/components/ui/BackLink";
import { getSiteSettings } from "@/lib/data/settings";

export const revalidate = 60;

function describe(description: string | null) {
  const base =
    description?.trim() ||
    "Help the Foundation give beneficial books to students of knowledge and mosques.";
  return base.length > 180 ? `${base.slice(0, 177)}...` : base;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    return { title: "Campaign not found", robots: { index: false } };
  }

  const { site } = await getSiteSettings();

  const description = describe(campaign.description);
  const images = campaign.image_url
    ? [{ url: campaign.image_url, alt: campaign.title }]
    : undefined;

  // These tags are what WhatsApp, Facebook, X and others read to show the
  // picture, title and caption when the link is shared
  return {
    title: campaign.title,
    description,
    alternates: { canonical: campaignPath(campaign.slug) },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: campaign.title,
      description,
      url: campaignPath(campaign.slug),
      images,
    },
    twitter: {
      card: campaign.image_url ? "summary_large_image" : "summary",
      title: campaign.title,
      description,
      images: campaign.image_url ? [campaign.image_url] : undefined,
    },
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) notFound();

  return (
    <section className="bg-gold-soft py-16 md:py-24">
      <Container>
        <BackLink href="/#campaign" className="mb-8">
          Back to the website
        </BackLink>
        <CampaignCard campaign={campaign} />
      </Container>
    </section>
  );
}
