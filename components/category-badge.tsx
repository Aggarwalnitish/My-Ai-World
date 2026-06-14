import { categoryColor } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        categoryColor(category),
        className,
      )}
    >
      {category}
    </span>
  );
}
