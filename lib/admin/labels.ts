export const campaignStatus = (c: {
  is_active: boolean;
  completed_at: string | null;
}) => (c.completed_at ? "Completed" : c.is_active ? "Active" : "Inactive");

export const BOOK_STATUSES = ["draft", "listed", "hidden"] as const;

const bookStatuses: Record<string, string> = {
  draft: "Draft",
  listed: "Listed",
  hidden: "Hidden",
};

export const bookStatusLabel = (status: string) =>
  bookStatuses[status] ?? status;

export const ENTITY_LABELS: Record<string, string> = {
  campaign: "Campaigns",
  book: "Books",
  order: "Orders",
  beneficiary: "Beneficiaries",
  donation: "Donations",
  session: "Sign-ins",
};
