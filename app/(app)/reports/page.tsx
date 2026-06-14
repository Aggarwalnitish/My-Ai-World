import Link from "next/link";
import { startOfToday, startOfYesterday, startOfDay, subDays, format } from "date-fns";
import { Wrench, Lightbulb, CalendarRange } from "lucide-react";
import { getActivitySince } from "@/lib/data";
import { CategoryBadge } from "@/components/category-badge";
import { ReportDigest } from "@/components/report-digest";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type RangeKey = "today" | "yesterday" | "week" | "month";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];

function resolveRange(key: RangeKey): { since: Date; until?: Date; label: string } {
  switch (key) {
    case "yesterday":
      return { since: startOfYesterday(), until: startOfToday(), label: "yesterday" };
    case "week":
      return { since: startOfDay(subDays(new Date(), 6)), label: "this week" };
    case "month":
      return { since: startOfDay(subDays(new Date(), 29)), label: "this month" };
    case "today":
    default:
      return { since: startOfToday(), label: "today" };
  }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const key: RangeKey = (["today", "yesterday", "week", "month"].includes(
    sp.range ?? "",
  )
    ? sp.range
    : "today") as RangeKey;

  const { since, until, label } = resolveRange(key);
  const { tools, notes } = await getActivitySince(since, until);

  // Group everything by category.
  type Entry = { kind: "tool" | "note"; id: string; title: string; sub: string };
  const byCategory = new Map<string, Entry[]>();
  for (const t of tools) {
    const list = byCategory.get(t.category) ?? [];
    list.push({ kind: "tool", id: t.id, title: t.name, sub: t.summary ?? "" });
    byCategory.set(t.category, list);
  }
  for (const n of notes) {
    const list = byCategory.get(n.category) ?? [];
    list.push({ kind: "note", id: n.id, title: n.title, sub: "Learning" });
    byCategory.set(n.category, list);
  }
  const groups = Array.from(byCategory.entries()).sort(
    (a, b) => b[1].length - a[1].length,
  );
  const total = tools.length + notes.length;

  const digestLines = [
    ...tools.map((t) => `Tool: ${t.name} — ${t.summary ?? t.category}`),
    ...notes.map((n) => `Learned: ${n.title}`),
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          What you added, grouped by category.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            href={`/reports?range=${r.key}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              key === r.key
                ? "bg-[var(--color-accent)] text-white"
                : "border text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
            )}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border bg-[var(--color-card)] p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <CalendarRange className="h-4 w-4" />
          {until
            ? format(since, "MMM d")
            : `${format(since, "MMM d")} – ${format(new Date(), "MMM d")}`}
        </div>
        <p className="mt-2 text-3xl font-semibold">
          {total} item{total === 1 ? "" : "s"}
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          {tools.length} tool{tools.length === 1 ? "" : "s"} · {notes.length}{" "}
          learning{notes.length === 1 ? "" : "s"} added {label}
        </p>
        {total > 0 && <ReportDigest lines={digestLines} rangeLabel={label} />}
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-[var(--color-muted)]">
          Nothing added {label} yet.
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(([category, entries]) => (
            <section key={category}>
              <div className="mb-2 flex items-center gap-2">
                <CategoryBadge category={category} />
                <span className="text-xs text-[var(--color-muted)]">
                  {entries.length}
                </span>
              </div>
              <div className="grid gap-2">
                {entries.map((e) => (
                  <Link
                    key={`${e.kind}-${e.id}`}
                    href={`/${e.kind === "tool" ? "tools" : "notes"}/${e.id}`}
                    className="flex items-start gap-3 rounded-lg border bg-[var(--color-card)] p-3 text-sm transition-colors hover:border-[var(--color-accent)]"
                  >
                    {e.kind === "tool" ? (
                      <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                    ) : (
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium">{e.title}</div>
                      {e.sub && (
                        <div className="truncate text-xs text-[var(--color-muted)]">
                          {e.sub}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
