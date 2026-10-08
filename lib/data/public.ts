import { createPublicClient } from "@/lib/supabase/public";
import type {
  Book,
  Campaign,
  CampaignWithStats,
  ImpactStats,
} from "@/lib/types";

const CAMPAIGN_FIELDS = "id, title, slug, description, image_url, target_kobo";

async function withStats(campaign: Campaign): Promise<CampaignWithStats> {
  const supabase = createPublicClient();

  const { data: stats } = await supabase
    .from("public_campaign_stats")
    .select("raised_kobo, supporters")
    .eq("campaign_id", campaign.id)
    .maybeSingle<{ raised_kobo: number; supporters: number }>();

  return {
    ...campaign,
    raised_kobo: stats?.raised_kobo ?? 0,
    supporters: stats?.supporters ?? 0,
  };
}

export async function getCurrentCampaign(): Promise<CampaignWithStats | null> {
  const supabase = createPublicClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(CAMPAIGN_FIELDS)
    .eq("is_active", true)
    .maybeSingle<Campaign>();

  if (error) console.error("getCurrentCampaign:", error.message);
  return campaign ? withStats(campaign) : null;
}

// Only the active campaign is public, so a past campaign's link shows "not found"
export async function getCampaignBySlug(
  slug: string,
): Promise<CampaignWithStats | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;

  const supabase = createPublicClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(CAMPAIGN_FIELDS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<Campaign>();

  if (error) console.error("getCampaignBySlug:", error.message);
  return campaign ? withStats(campaign) : null;
}

const BOOK_FIELDS = "id, title, author, description, cover_url, price_kobo";

// /books page: search and pagination
export async function getBooksPage({
  q,
  page,
  pageSize = 12,
}: {
  q?: string;
  page: number;
  pageSize?: number;
}): Promise<{ books: Book[]; total: number }> {
  const supabase = createPublicClient();

  let query = supabase.from("books").select(BOOK_FIELDS, { count: "exact" });

  // Whitelist letters, numbers, spaces, apostrophes and hyphens before it
  // goes into a filter string
  const term = q?.replace(/[^\p{L}\p{N}\s'’-]/gu, " ").trim();
  if (term) query = query.or(`title.ilike.%${term}%,author.ilike.%${term}%`);

  const from = (page - 1) * pageSize;

  const { data, count, error } = await query
    .order("title")
    .range(from, from + pageSize - 1)
    .returns<Book[]>();

  if (error) console.error("getBooksPage:", error.message);
  return { books: data ?? [], total: count ?? 0 };
}

export async function getImpact(): Promise<ImpactStats | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("public_impact")
    .select("*")
    .single<ImpactStats>();

  if (error) console.error("getImpact:", error.message);
  return data ?? null;
}
