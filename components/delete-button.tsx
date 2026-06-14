"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteButton({
  kind,
  id,
  redirectTo,
}: {
  kind: "tools" | "notes";
  id: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Delete this item? This can't be undone.")) return;
    setLoading(true);
    await fetch(`/api/${kind}/${id}`, { method: "DELETE" });
    if (redirectTo) router.replace(redirectTo);
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      disabled={loading}
      title="Delete"
      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs text-[var(--color-muted)] hover:text-red-500 hover:border-red-300 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
