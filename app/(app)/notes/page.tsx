import { getNotes } from "@/lib/data";
import { QuickAdd } from "@/components/quick-add";
import { NotesExplorer } from "@/components/notes-explorer";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await getNotes();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Learnings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {notes.length} concept{notes.length === 1 ? "" : "s"} — your notes plus
          an explainer from the web.
        </p>
      </header>
      <QuickAdd defaultMode="note" />
      <NotesExplorer notes={notes} />
    </div>
  );
}
