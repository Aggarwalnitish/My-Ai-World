"use client";

import { useMemo, useState } from "react";
import { Search, Wrench } from "lucide-react";
import type { Tool } from "@prisma/client";
import { ToolCard, EmptyState } from "@/components/cards";
import { cn } from "@/lib/utils";

export function ToolsExplorer({ tools }: { tools: Tool[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(tools.map((t) => t.category))).sort()],
    [tools],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.summary?.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [tools, query, category]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools…"
          className="w-full rounded-lg border bg-[var(--color-card)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                category === c
                  ? "bg-[var(--color-accent)] text-white"
                  : "border text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-5 w-5" />}
          title="Nothing here"
          subtitle={
            tools.length === 0
              ? "Add your first tool from the dashboard."
              : "No tools match your filter."
          }
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      )}
    </div>
  );
}
