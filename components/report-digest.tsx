"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function ReportDigest({
  lines,
  rangeLabel,
}: {
  lines: string[];
  rangeLabel: string;
}) {
  const [digest, setDigest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/report/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, rangeLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.digest) setDigest(data.digest);
      else setError("AI isn't configured yet.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (digest) {
    return (
      <p className="mt-4 rounded-lg bg-[var(--color-accent)]/10 p-3 text-sm leading-relaxed">
        {digest}
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={generate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {loading ? "Writing…" : "Summarize with AI"}
      </button>
      {error && <p className="mt-2 text-xs text-amber-600">{error}</p>}
    </div>
  );
}
