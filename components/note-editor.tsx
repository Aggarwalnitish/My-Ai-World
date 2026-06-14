"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, Loader2 } from "lucide-react";

export function NoteEditor({
  kind,
  id,
  field,
  initial,
  placeholder,
}: {
  kind: "tools" | "notes";
  id: string;
  field: "userNote" | "userNotes";
  initial: string;
  placeholder: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/${kind}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="group">
        {initial ? (
          <p className="whitespace-pre-wrap text-sm text-[var(--color-foreground)]/90">
            {initial}
          </p>
        ) : (
          <p className="text-sm italic text-[var(--color-muted)]">{placeholder}</p>
        )}
        <button
          onClick={() => setEditing(true)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)]"
        >
          <Pencil className="h-3 w-3" />
          {initial ? "Edit" : "Add a note"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          Save
        </button>
        <button
          onClick={() => {
            setValue(initial);
            setEditing(false);
          }}
          className="text-xs text-[var(--color-muted)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
