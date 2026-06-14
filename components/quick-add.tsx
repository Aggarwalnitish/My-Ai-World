"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wrench, Lightbulb, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "tool" | "note";

export function QuickAdd({ defaultMode = "tool" }: { defaultMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "tool" ? "/api/tools" : "/api/notes";
      const payload =
        mode === "tool"
          ? { rawInput: value, userNote: note }
          : { title: value, userNotes: note };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add");
      }
      setValue("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border bg-[var(--color-card)] p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <ModeButton
          active={mode === "tool"}
          onClick={() => setMode("tool")}
          icon={<Wrench className="h-3.5 w-3.5" />}
          label="AI Tool"
        />
        <ModeButton
          active={mode === "note"}
          onClick={() => setMode("note")}
          icon={<Lightbulb className="h-3.5 w-3.5" />}
          label="Learning"
        />
      </div>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          mode === "tool"
            ? "Paste a tool name or link, e.g. Runway or https://runwayml.com"
            : "A concept you learned, e.g. Generative Engine Optimization"
        }
        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={
          mode === "tool"
            ? "Your own note (optional)"
            : "Your own notes / thoughts (optional)"
        }
        rows={mode === "note" ? 3 : 2}
        className="mt-2 w-full resize-none rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-[var(--color-muted)]">
          {loading ? (
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Researching &amp; organizing — a
              few seconds…
            </span>
          ) : (
            "AI will summarize and categorize it for you."
          )}
        </p>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-[var(--color-accent)] text-white"
          : "border text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
