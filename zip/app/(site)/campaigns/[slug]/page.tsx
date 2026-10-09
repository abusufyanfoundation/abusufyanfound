import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignCard } from "@/components/site/CampaignCard";
import { Container } from "@/components/site/Container";
import { getCampaignBySlug } from "@/lib/data/public";
import { campaignPath } from "@/lib/share";
import { siteConfig } from "@/lib/site";
import { BiChevronLeft } from "react-icons/bi";

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
      siteName: siteConfig.name,
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
        <Link
          href="/#campaign"
          className="flex items-center mb-8 text-sm text-muted transition-colors hover:text-navy"
        >
          <BiChevronLeft className="text-2xl"/> Back to the website
        </Link>
        <CampaignCard campaign={campaign} />
      </Container>
    </section>
  );
}
