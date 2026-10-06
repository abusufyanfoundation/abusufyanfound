// Keeps letters, numbers, spaces and a few safe symbols before text
// goes into a database filter string.
export const cleanSearch = (q?: string) =>
  q
    ?.replace(/[^\p{L}\p{N}\s'’@._+-]/gu, " ")
    .trim()
    .slice(0, 80) || undefined;

export const parsePage = (p?: string) =>
  Math.max(1, Number.parseInt(p ?? "1", 10) || 1);
