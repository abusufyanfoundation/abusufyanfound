import { createPublicClient } from "@/lib/supabase/public";
import type {
  Book,
  Campaign,
  CampaignWithStats,
  ImpactStats,
} from "@/lib/types";

export async function getCurrentCampaign(): Promise<CampaignWithStats | null> {
  const supabase = createPublicClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("id, title, slug, description, image_url, target_kobo")
    .eq("is_active", true)
    .maybeSingle<Campaign>();

  if (error) console.error("getCurrentCampaign:", error.message);
  if (!campaign) return null;

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

const BOOK_FIELDS =
  "id, title, author, description, cover_url, price_kobo, available_quantity";

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
