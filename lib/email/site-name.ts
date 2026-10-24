import "server-only";
import { getSiteSettings } from "@/lib/data/settings";
import { siteConfig } from "@/lib/site";

// Falls back to the built-in name if settings cannot be read
export async function siteName(): Promise<string> {
  try {
    return (await getSiteSettings()).site.name;
  } catch {
    return siteConfig.name;
  }
}
