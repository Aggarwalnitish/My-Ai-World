// The starting category taxonomy. Claude picks the best fit when enriching a
// tool, or proposes a new category if nothing fits — so this list is a seed,
// not a hard limit.

export const CATEGORIES = [
  "Image Generation",
  "Image Editing",
  "Video Generation",
  "Video Editing",
  "Audio & Music",
  "Voice & Speech",
  "Writing & Text",
  "Code & Development",
  "Design & UI",
  "3D & Modeling",
  "Marketing & SEO",
  "Research & Search",
  "Productivity",
  "Agents & Automation",
  "Data & Analytics",
  "Chatbots & Assistants",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// A stable color per category for chips/badges in the UI (Tailwind classes).
const PALETTE = [
  "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
];

/** Deterministic color classes for a category label. */
export function categoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
