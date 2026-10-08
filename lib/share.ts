import { siteConfig, siteUrl } from "./site";

export const campaignPath = (slug: string) => `/campaigns/${slug}`;
export const campaignUrl = (slug: string) => `${siteUrl}${campaignPath(slug)}`;

// Short caption that goes with the shared link
export function campaignShareText(title: string) {
  const short = title.length > 90 ? `${title.slice(0, 87)}...` : title;
  return `Support “${short}”: help the ${siteConfig.name} give beneficial books to students of knowledge and mosques.`;
}
