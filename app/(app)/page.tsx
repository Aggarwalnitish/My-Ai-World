import Link from "next/link";
import { Wrench, Lightbulb, ArrowRight } from "lucide-react";
import { getTools, getNotes } from "@/lib/data";
import { QuickAdd } from "@/components/quick-add";
import { ToolCard, NoteCard, EmptyState } from "@/components/cards";
import { CategoryBadge } from "@/components/category-badge";

export const dynamic = "force-dynamic";

function isToday(d: Date) {
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export default async function Dashboard() {
  const [tools, notes] = await Promise.all([getTools(), getNotes()]);

  const toolsToday = tools.filter((t) => isToday(t.createdAt)).length;
  const notesToday = notes.filter((n) => isToday(n.createdAt)).length;

  const categories = Array.from(
    new Set(tools.map((t) => t.category)),
  ).slice(0, 10);

  const recentTools = tools.slice(0, 4);
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Your AI World</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {toolsToday + notesToday > 0
            ? `You've added ${toolsToday + notesToday} thing${
                toolsToday + notesToday === 1 ? "" : "s"
              } today. Keep it going.`
            : "Add the tools and ideas you discover — I'll summarize and sort them."}
        </p>
      </header>

      <QuickAdd />

      <section className="grid grid-cols-2 gap-3">
        <Stat label="Tools tracked" value={tools.length} href="/tools" />
        <Stat label="Learnings" value={notes.length} href="/notes" />
      </section>

      {categories.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-[var(--color-muted)]">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <CategoryBadge key={c} category={c} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <SectionHeader
          icon={<Wrench className="h-4 w-4" />}
          title="Recent tools"
          href="/tools"
        />
        {recentTools.length === 0 ? (
          <EmptyState
            icon={<Wrench className="h-5 w-5" />}
            title="No tools yet"
            subtitle="Paste a tool name or link above to get started."
          />
        ) : (
          <div className="grid gap-3">
            {recentTools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader
          icon={<Lightbulb className="h-4 w-4" />}
          title="Recent learnings"
          href="/notes"
        />
        {recentNotes.length === 0 ? (
          <EmptyState
            icon={<Lightbulb className="h-5 w-5" />}
            title="No learnings yet"
            subtitle="Jot down a concept above — I'll explain it and keep your notes."
          />
        ) : (
          <div className="grid gap-3">
            {recentNotes.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-[var(--color-card)] p-4 transition-colors hover:border-[var(--color-accent)]"
    >
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-[var(--color-muted)]">{label}</div>
    </Link>
  );
}

function SectionHeader({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      >
        View all <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
