import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Abu Sufyan Al-Alma'iyy Foundation",
    template: "%s | Abu Sufyan Al-Alma'iyy Foundation",
  },
  description:
    "A non-profit organisation donating the noble Qur'an and beneficial books to students of knowledge and mosques.",
  openGraph: {
    type: "website",
    siteName: "Abu Sufyan Al-Alma'iyy Foundation",
    title: "Abu Sufyan Al-Alma'iyy Foundation",
    description:
      "A non-profit organisation donating the noble Qur'an and beneficial books to students of knowledge and mosques.",
    url: siteUrl,
  },
};

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
      <body>{children}</body>
    </html>
  );
}
