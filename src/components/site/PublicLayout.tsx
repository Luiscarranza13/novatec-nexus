import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SiteEnhancements } from "./SiteEnhancements";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 page-motion">{children}</main>
      <Footer />
      <SiteEnhancements />
    </div>
  );
}
