"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders markdown with sensible prose styling for AI explainers. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-[var(--color-foreground)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h2 className="text-lg font-semibold mt-4" {...p} />,
          h2: (p) => <h3 className="text-base font-semibold mt-4" {...p} />,
          h3: (p) => <h4 className="font-semibold mt-3" {...p} />,
          p: (p) => <p className="text-[var(--color-foreground)]/90" {...p} />,
          ul: (p) => <ul className="list-disc pl-5 space-y-1" {...p} />,
          ol: (p) => <ol className="list-decimal pl-5 space-y-1" {...p} />,
          a: (p) => (
            <a
              className="text-[var(--color-accent)] underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
              {...p}
            />
          ),
          code: (p) => (
            <code
              className="rounded bg-black/5 dark:bg-white/10 px-1 py-0.5 text-xs"
              {...p}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
