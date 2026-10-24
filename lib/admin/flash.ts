import { redirect } from "next/navigation";

// Sends the admin back to a page with a banner message
export function flash(
  path: string,
  key: "error" | "notice",
  message: string,
  keep: Record<string, string | undefined> = {},
): never {
  const sp = new URLSearchParams();
  for (const [name, value] of Object.entries(keep)) {
    if (value) sp.set(name, value);
  }
  sp.set(key, message);
  return redirect(`${path}?${sp.toString()}`);
}
