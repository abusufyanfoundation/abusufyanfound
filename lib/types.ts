export type Campaign = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  target_kobo: number;
};

export type CampaignWithStats = Campaign & {
  raised_kobo: number;
  supporters: number;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  price_kobo: number;
  available_quantity: number;
};

export type ImpactStats = {
  campaign_funds_kobo: number;
  prefund_funds_kobo: number;
  books_distributed: number;
  students_supported: number;
  mosques_supported: number;
  completed_batches: number;
  active_campaigns: number;
};
