export type Change = { field: string; from: string; to: string };

const clip = (s: string) => (s.length > 120 ? `${s.slice(0, 117)}...` : s);

// Compares two sets of already-formatted values and lists what changed
export function diffFields(
  before: Record<string, string>,
  after: Record<string, string>,
): Change[] {
  return Object.keys(after)
    .filter((key) => (before[key] ?? "") !== after[key])
    .map((key) => ({
      field: key,
      from: clip(before[key] ?? ""),
      to: clip(after[key]),
    }));
}
