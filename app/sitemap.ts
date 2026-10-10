import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/books`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/apply`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/apply/request`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Only the active campaign is public, so only it is listed
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("slug, updated_at")
    .eq("is_active", true)
    .returns<{ slug: string; updated_at: string }[]>();

  if (error) console.error("sitemap campaigns:", error.message);

  for (const c of data ?? []) {
    entries.push({
      url: `${siteUrl}/campaigns/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  return entries;
}
