import type { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

type DonationRef = {
  id: string;
  type: string;
  campaign_id: string | null;
  batch_id: string | null;
};

export type GivenTo = { name: string; batch: number | null };

// Where each donation went, looked up with two small queries for the whole list
export async function loadGivenTo(
  supabase: Client,
  donations: DonationRef[],
): Promise<Map<string, GivenTo>> {
  const campaignIds = [
    ...new Set(
      donations.flatMap((d) => (d.campaign_id ? [d.campaign_id] : [])),
    ),
  ];
  const batchIds = [
    ...new Set(donations.flatMap((d) => (d.batch_id ? [d.batch_id] : []))),
  ];

  const titles = new Map<string, string>();
  const numbers = new Map<string, number>();

  if (campaignIds.length) {
    const { data } = await supabase
      .from("campaigns")
      .select("id, title")
      .in("id", campaignIds)
      .returns<{ id: string; title: string }[]>();
    for (const r of data ?? []) titles.set(r.id, r.title);
  }

  if (batchIds.length) {
    const { data } = await supabase
      .from("batches")
      .select("id, batch_number")
      .in("id", batchIds)
      .returns<{ id: string; batch_number: number }[]>();
    for (const r of data ?? []) numbers.set(r.id, r.batch_number);
  }

  const result = new Map<string, GivenTo>();
  for (const d of donations) {
    if (d.type === "book") {
      result.set(d.id, { name: "Chosen books", batch: null });
    } else if (!d.campaign_id) {
      result.set(d.id, { name: "The Foundation in general", batch: null });
    } else {
      result.set(d.id, {
        name: titles.get(d.campaign_id) ?? "Campaign",
        batch: d.batch_id ? (numbers.get(d.batch_id) ?? null) : null,
      });
    }
  }
  return result;
}
