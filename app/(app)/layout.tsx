import { Nav } from "@/components/nav";
import { MobileNav } from "@/components/mobile-nav";
import { SetupBanner } from "@/components/setup-banner";
import { hasDatabase } from "@/lib/db";
import { hasAI } from "@/lib/ai";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:block border-r sticky top-0 h-screen">
        <Nav />
      </aside>
      <div className="pb-20 md:pb-0">
        <main className="mx-auto w-full max-w-3xl p-4 md:p-8">
          <SetupBanner hasDatabase={hasDatabase} hasAI={hasAI} />
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
