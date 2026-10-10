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
    "The Abu Sufyan Al-Alma'iyy Foundation is a non-profit foundation dedicated to the donation of the noble Qur'an and beneficial Islamic books to students of knowledge, Islamic schools, and to mosques to promote the understanding of Islam amongst all.",
  openGraph: {
    type: "website",
    siteName: "Abu Sufyan Al-Alma'iyy Foundation",
    title: "Abu Sufyan Al-Alma'iyy Foundation",
    description:
      "The Abu Sufyan Al-Alma'iyy Foundation is a non-profit foundation dedicated to the donation of the noble Qur'an and beneficial Islamic books to students of knowledge, Islamic schools, and to mosques to promote the understanding of Islam amongst all.",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
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
