import type { Metadata } from "next";
import { Newsreader, Public_Sans } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Abu Sufyan Al-Alma'iyy Foundation",
    template: "%s | Abu Sufyan Al-Alma'iyy Foundation",
  },
  description:
    "A charitable Islamic foundation providing beneficial books and materials to students of knowledge.",
  openGraph: {
    type: "website",
    siteName: "Abu Sufyan Al-Alma'iyy Foundation",
    title: "Abu Sufyan Al-Alma'iyy Foundation",
    description:
      "Supporting students of knowledge through beneficial Islamic books and materials.",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${newsreader.variable} ${publicSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
