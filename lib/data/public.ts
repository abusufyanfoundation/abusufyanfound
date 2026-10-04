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
    .select("id, title, slug, description, image_url, target_kobo, deadline")
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
    closed: campaign.deadline
      ? new Date(campaign.deadline).getTime() < Date.now()
      : false,
  };
}

export async function getBooks(campaignId: string): Promise<Book[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("books")
    .select(
      "id, title, author, description, cover_url, price_kobo, available_quantity",
    )
    .eq("campaign_id", campaignId)
    .order("title")
    .returns<Book[]>();

  if (error) console.error("getBooks:", error.message);
  return data ?? [];
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
