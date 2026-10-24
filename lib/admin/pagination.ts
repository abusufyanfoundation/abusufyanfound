export const ADMIN_PAGE_SIZE = 25;

export const pageFrom = (raw: string | undefined) =>
  Math.max(1, parseInt(raw ?? "1", 10) || 1);

export const rangeFor = (page: number) => ({
  from: (page - 1) * ADMIN_PAGE_SIZE,
  to: page * ADMIN_PAGE_SIZE - 1,
});

export const pagesFor = (count: number | null) =>
  Math.max(1, Math.ceil((count ?? 0) / ADMIN_PAGE_SIZE));

// Reads the hidden "page" field of a form, so an action returns to the same page
export function pageField(formData: FormData): string | undefined {
  const n = parseInt(String(formData.get("page") ?? ""), 10);
  return Number.isInteger(n) && n > 1 && n < 10000 ? String(n) : undefined;
}
