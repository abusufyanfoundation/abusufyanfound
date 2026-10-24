import type { BankDetails } from "./data/settings";
import { siteConfig, siteUrl } from "./site";

export const campaignPath = (slug: string) => `/campaigns/${slug}`;
export const campaignUrl = (slug: string) => `${siteUrl}${campaignPath(slug)}`;

// Short caption for people to post. The Foundation account is added only
// when campaign bank transfer is switched on and the details are complete.
export function campaignCaption(
  title: string,
  url: string,
  bank: BankDetails | null,
  siteName: string = siteConfig.name,
) {
  const short = title.length > 90 ? `${title.slice(0, 87)}...` : title;

  const lines = [
    `Support “${short}”.`,
    `Help the ${siteName} give beneficial books to students of knowledge and mosques.`,
    "",
    `Give online: ${url}`,
  ];

  if (bank) {
    lines.push(
      "",
      "Or give by bank transfer:",
      `${bank.bank} · ${bank.number}`,
      bank.name,
    );
  }

  return lines.join("\n");
}
