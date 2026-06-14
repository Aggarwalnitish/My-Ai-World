import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import type { Tool, Note } from "@prisma/client";
import { CategoryBadge } from "@/components/category-badge";

function StatusHint({ status }: { status: string }) {
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)]">
        <Loader2 className="h-3 w-3 animate-spin" /> summarizing…
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
        <AlertCircle className="h-3 w-3" /> needs a manual touch
      </span>
    );
  return null;
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.id}`}
      className="block rounded-xl border bg-[var(--color-card)] p-4 transition-colors hover:border-[var(--color-accent)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{tool.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">
            {tool.summary || tool.rawInput}
          </p>
        </div>
        <CategoryBadge category={tool.category} className="shrink-0" />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>{formatDistanceToNow(tool.createdAt, { addSuffix: true })}</span>
        <StatusHint status={tool.status} />
      </div>
    </Link>
  );
}

export function NoteCard({ note }: { note: Note }) {
  const preview =
    note.userNotes?.slice(0, 140) ||
    note.aiSummary?.replace(/[#*`>_-]/g, "").slice(0, 140) ||
    "";
  return (
    <Link
      href={`/notes/${note.id}`}
      className="block rounded-xl border bg-[var(--color-card)] p-4 transition-colors hover:border-[var(--color-accent)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate font-medium">{note.title}</h3>
        <CategoryBadge category={note.category} className="shrink-0" />
      </div>
      {preview && (
        <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">
          {preview}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>{formatDistanceToNow(note.createdAt, { addSuffix: true })}</span>
        <StatusHint status={note.status} />
      </div>
    </Link>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-[var(--color-muted)]">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
    </div>
  );
}

export { ExternalLink };
