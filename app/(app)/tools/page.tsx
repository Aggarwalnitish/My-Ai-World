import { getTools } from "@/lib/data";
import { QuickAdd } from "@/components/quick-add";
import { ToolsExplorer } from "@/components/tools-explorer";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await getTools();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Tools</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {tools.length} tool{tools.length === 1 ? "" : "s"} tracked, auto-sorted
          by category.
        </p>
      </header>
      <QuickAdd defaultMode="tool" />
      <ToolsExplorer tools={tools} />
    </div>
  );
}
