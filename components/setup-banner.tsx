import { AlertTriangle } from "lucide-react";

/** Shown when the database or AI key isn't configured yet. */
export function SetupBanner({
  hasDatabase,
  hasAI,
}: {
  hasDatabase: boolean;
  hasAI: boolean;
}) {
  if (hasDatabase && hasAI) return null;

  const missing: string[] = [];
  if (!hasDatabase) missing.push("a database (DATABASE_URL)");
  if (!hasAI) missing.push("an Anthropic API key (ANTHROPIC_API_KEY)");

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div>
        <p className="font-medium text-amber-800 dark:text-amber-300">
          Setup needed
        </p>
        <p className="mt-1 text-amber-700 dark:text-amber-200/80">
          Add {missing.join(" and ")} to your environment to unlock{" "}
          {hasDatabase ? "AI summaries" : "saving and AI features"}. The app runs
          without them, but features stay limited until they&apos;re set.
        </p>
      </div>
    </div>
  );
}
