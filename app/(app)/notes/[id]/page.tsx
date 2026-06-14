import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Loader2, AlertCircle, Globe, ExternalLink } from "lucide-react";
import { getNote } from "@/lib/data";
import { CategoryBadge } from "@/components/category-badge";
import { DeleteButton } from "@/components/delete-button";
import { NoteEditor } from "@/components/note-editor";
import { Markdown } from "@/components/markdown";

export const dynamic = "force-dynamic";

export default async function NoteDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getNote(id);
  if (!note) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/notes"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Learnings
      </Link>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold">{note.title}</h1>
          <DeleteButton kind="notes" id={note.id} redirectTo="/notes" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={note.category} />
          <span className="text-xs text-[var(--color-muted)]">
            Added {format(note.createdAt, "MMM d, yyyy")}
          </span>
        </div>
      </header>

      {note.status === "processing" && (
        <p className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Researching an explainer —
          refresh in a moment.
        </p>
      )}
      {note.status === "failed" && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-4 w-4" /> Couldn&apos;t fetch an explainer
          automatically. Your own notes below are saved.
        </p>
      )}

      {/* My notes — first, since they're yours */}
      <section className="rounded-xl border bg-[var(--color-card)] p-4">
        <h2 className="mb-2 text-sm font-medium">My notes</h2>
        <NoteEditor
          kind="notes"
          id={note.id}
          field="userNotes"
          initial={note.userNotes ?? ""}
          placeholder="Your own take, examples, links…"
        />
      </section>

      {/* From the web */}
      {(note.aiSummary || note.keyPoints.length > 0) && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
            <Globe className="h-4 w-4" /> From the web
          </h2>
          {note.aiSummary && <Markdown>{note.aiSummary}</Markdown>}
          {note.keyPoints.length > 0 && (
            <div className="rounded-xl border bg-[var(--color-card)] p-4">
              <h3 className="mb-2 text-sm font-medium">Key points</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-foreground)]/90">
                {note.keyPoints.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
          )}
          {note.sources.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-medium text-[var(--color-muted)]">
                Sources
              </h3>
              <ul className="space-y-1">
                {note.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] underline underline-offset-2 break-all"
                    >
                      {s} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border px-2.5 py-0.5 text-xs text-[var(--color-muted)]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
