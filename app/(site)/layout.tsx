import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SelectionBar } from "@/components/site/selection/SelectionBar";
import { SelectionProvider } from "@/components/site/selection/SelectionProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SelectionProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-2 focus:text-navy-deep"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <SelectionBar />
    </SelectionProvider>
  );
}
