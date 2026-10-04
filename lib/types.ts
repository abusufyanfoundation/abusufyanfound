export type Campaign = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  target_kobo: number;
  deadline: string | null;
};

export type CampaignWithStats = Campaign & {
  raised_kobo: number;
  supporters: number;
  closed: boolean;
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
  funds_raised_kobo: number;
  books_distributed: number;
  students_supported: number;
  completed_batches: number;
  active_campaigns: number;
};
