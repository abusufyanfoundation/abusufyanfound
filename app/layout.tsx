import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import localFont from "next/font/local";
import { getSiteSettings } from "@/lib/data/settings";
import { siteUrl } from "@/lib/site";
import { ActivityIndicator } from "@/components/ui/ActivityIndicator";
import "./globals.css";
import { Suspense } from "react";

const clashDisplay = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash-display",
  weight: "200 700",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSiteSettings();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: site.name,
      description: site.description,
      url: siteUrl,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${publicSans.variable}`}
    >
      <body>
        <Suspense fallback={null}>
          <ActivityIndicator />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
