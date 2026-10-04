import type { Metadata } from "next";
import { About } from "@/components/site/About";
import { BooksSection } from "@/components/site/BooksSection";
import { CampaignSection } from "@/components/site/CampaignSection";
import { Hero } from "@/components/site/Hero";
// import { HowItWorks } from "@/components/site/HowItWorks";
import { ImpactSection } from "@/components/site/ImpactSection";
import { WhatWeDo } from "@/components/site/WhatWeDo";
import { getCurrentCampaign, getImpact } from "@/lib/data/public";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Rebuild the cached page at most once a minute
export const revalidate = 60;

export default async function HomePage() {
  const [campaign, impact] = await Promise.all([
    getCurrentCampaign(),
    getImpact(),
  ]);

  return (
    <>
      <Hero />
      <About />
      <WhatWeDo />
      {/* <HowItWorks /> */}
      <ImpactSection impact={impact} />
      <CampaignSection campaign={campaign} />
      <BooksSection />
    </>
  );
}
