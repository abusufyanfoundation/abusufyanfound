import { createPublicClient } from "@/lib/supabase/public";

export type OpenBatch = {
  id: string;
  title: string;
  description: string | null;
  max_copies_per_applicant: number;
  closes_at: string | null;
  batch_books: { id: string; title: string; author: string | null }[];
  batch_locations: { id: string; name: string; address: string }[];
};

type Row = OpenBatch & { opens_at: string | null };

const FIELDS =
  "id, title, description, max_copies_per_applicant, opens_at, closes_at, batch_books(id, title, author), batch_locations(id, name, address)";

const UUID = /^[0-9a-f-]{36}$/i;

// The database only checks that a batch is "open"; the dates are checked here too
const inWindow = (b: Row) => {
  const now = Date.now();
  return (
    (!b.opens_at || new Date(b.opens_at).getTime() <= now) &&
    (!b.closes_at || new Date(b.closes_at).getTime() >= now)
  );
};

// A batch people can apply to needs books and at least one place to collect them
const usable = (b: Row) =>
  inWindow(b) && b.batch_books.length > 0 && b.batch_locations.length > 0;

const tidy = (b: Row): OpenBatch => ({
  id: b.id,
  title: b.title,
  description: b.description,
  max_copies_per_applicant: b.max_copies_per_applicant,
  closes_at: b.closes_at,
  batch_books: [...b.batch_books].sort((a, c) =>
    a.title.localeCompare(c.title),
  ),
  batch_locations: [...b.batch_locations].sort((a, c) =>
    a.name.localeCompare(c.name),
  ),
});

export async function getOpenBatches(): Promise<OpenBatch[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("batches")
    .select(FIELDS)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  if (error) console.error("getOpenBatches:", error.message);

  return (data ?? []).filter(usable).map(tidy);
}

export async function getOpenBatch(id: string): Promise<OpenBatch | null> {
  if (!UUID.test(id)) return null;

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("batches")
    .select(FIELDS)
    .eq("id", id)
    .eq("status", "open")
    .maybeSingle<Row>();

  if (error) console.error("getOpenBatch:", error.message);

  return data && usable(data) ? tidy(data) : null;
}
