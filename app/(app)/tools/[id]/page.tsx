import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { getTool } from "@/lib/data";
import { CategoryBadge } from "@/components/category-badge";
import { DeleteButton } from "@/components/delete-button";
import { NoteEditor } from "@/components/note-editor";

export const dynamic = "force-dynamic";

export default async function ToolDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tool = await getTool(id);
  if (!tool) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Tools
      </Link>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold">{tool.name}</h1>
          <DeleteButton kind="tools" id={tool.id} redirectTo="/tools" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={tool.category} />
          <span className="text-xs text-[var(--color-muted)]">
            Added {format(tool.createdAt, "MMM d, yyyy")}
          </span>
          {tool.url && (
            <a
              href={tool.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] underline underline-offset-2"
            >
              Visit site <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </header>

      {tool.status === "processing" && (
        <p className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Still summarizing — refresh
          in a moment.
        </p>
      )}
      {tool.status === "failed" && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-4 w-4" /> AI couldn&apos;t summarize this one
          automatically. Your note below still works.
        </p>
      )}

      {tool.summary && (
        <p className="text-lg leading-relaxed">{tool.summary}</p>
      )}
      {tool.details && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-foreground)]/90">
          {tool.details}
        </p>
      )}

      {tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tool.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border px-2.5 py-0.5 text-xs text-[var(--color-muted)]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <section className="rounded-xl border bg-[var(--color-card)] p-4">
        <h2 className="mb-2 text-sm font-medium">My note</h2>
        <NoteEditor
          kind="tools"
          id={tool.id}
          field="userNote"
          initial={tool.userNote ?? ""}
          placeholder="Why this caught your eye, how you'd use it…"
        />
      </section>
    </div>
  );
}
