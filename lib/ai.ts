import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES } from "@/lib/taxonomy";

/** True when an Anthropic API key is configured — gates all smart features. */
export const hasAI = Boolean(process.env.ANTHROPIC_API_KEY);

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

// Adaptive thinking is only valid on these tiers — Haiku 4.5 / older Sonnet 400 on it.
const SUPPORTS_ADAPTIVE_THINKING = /^claude-(opus-4-(6|7|8)|sonnet-4-6|fable-5)/.test(
  MODEL,
);

const client = hasAI ? new Anthropic() : null;

// Anthropic server tools: search the web and fetch page content.
// `allowed_callers: ["direct"]` disables programmatic (code-driven) tool calling,
// which lighter models like Haiku 4.5 don't support — they call the tools directly.
const WEB_TOOLS = [
  { type: "web_search_20260209", name: "web_search", allowed_callers: ["direct"] },
  { type: "web_fetch_20260209", name: "web_fetch", allowed_callers: ["direct"] },
];

function textOf(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function researchParams(messages: Anthropic.MessageParam[]): Record<string, unknown> {
  const params: Record<string, unknown> = {
    model: MODEL,
    max_tokens: 8000,
    tools: WEB_TOOLS,
    messages,
  };
  if (SUPPORTS_ADAPTIVE_THINKING) params.thinking = { type: "adaptive" };
  return params;
}

/** Step 1: let Claude research the web and return a plain-text findings report. */
async function research(prompt: string): Promise<string> {
  if (!client) throw new Error("AI not configured");
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res = await client.messages.create(researchParams(messages) as any);

  // Server-tool loop: the API pauses at its iteration cap — re-send to resume.
  let guard = 0;
  while (res.stop_reason === "pause_turn" && guard++ < 5) {
    messages.push({ role: "assistant", content: res.content });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res = await client.messages.create(researchParams(messages) as any);
  }
  return textOf(res.content);
}

/** Step 2: turn the findings into validated JSON via structured outputs. */
async function structure<T>(prompt: string, schema: object): Promise<T | null> {
  if (!client) throw new Error("AI not configured");
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
    // output_config is newer than the pinned SDK types — cast through.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    output_config: { format: { type: "json_schema", schema } },
  } as any);
  const text = textOf(res.content);
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ── Tools ────────────────────────────────────────────────────────────────

export interface EnrichedTool {
  name: string;
  url: string;
  summary: string;
  details: string;
  category: string;
  tags: string[];
}

const TOOL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    url: { type: "string" },
    summary: { type: "string" },
    details: { type: "string" },
    category: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["name", "url", "summary", "details", "category", "tags"],
};

export async function enrichTool(rawInput: string): Promise<EnrichedTool | null> {
  const findings = await research(
    `You are helping catalog AI tools. Research this AI tool and report what you find.\n\n` +
      `Tool (name or URL): ${rawInput}\n\n` +
      `Use web search and web fetch to locate the official website and understand the product. ` +
      `Report: the official name, official homepage URL, what it does, who it's for, key features, ` +
      `and pricing model if available. End your report with a line "SOURCES:" listing the URLs you used.`,
  );

  return structure<EnrichedTool>(
    `Based on the research below about an AI tool, produce structured catalog data.\n\n` +
      `Pick the single best category from this list; only invent a new short category name if none fit:\n` +
      `${CATEGORIES.join(", ")}\n\n` +
      `Raw user input: ${rawInput}\n\nResearch:\n${findings}\n\n` +
      `Return JSON with: name (official name), url (official homepage, or "" if unknown), ` +
      `summary (one punchy sentence on what it does), details (2-4 sentences), ` +
      `category (best fit), tags (3-6 lowercase keywords).`,
    TOOL_SCHEMA,
  );
}

// ── Notes / learnings ──────────────────────────────────────────────────────

export interface EnrichedNote {
  aiSummary: string;
  keyPoints: string[];
  sources: string[];
  category: string;
  tags: string[];
}

const NOTE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    aiSummary: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" } },
    sources: { type: "array", items: { type: "string" } },
    category: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["aiSummary", "keyPoints", "sources", "category", "tags"],
};

export async function explainConcept(
  title: string,
  userNotes?: string,
): Promise<EnrichedNote | null> {
  const findings = await research(
    `Research this concept/term and explain it clearly: "${title}".\n\n` +
      `Use web search to find authoritative, up-to-date explanations. Cover what it is, why it ` +
      `matters, and the key points someone should know. End with a line "SOURCES:" listing the URLs you used.`,
  );

  const notesContext = userNotes
    ? `\n\nThe user also wrote these personal notes (for context only, do not copy them): ${userNotes}`
    : "";

  return structure<EnrichedNote>(
    `Based on the research below about the concept "${title}", produce structured data.${notesContext}\n\n` +
      `Pick the single best category from this list; only invent a new short one if none fit:\n` +
      `${CATEGORIES.join(", ")}\n\nResearch:\n${findings}\n\n` +
      `Return JSON with: aiSummary (a clear 2-4 paragraph explainer in markdown), ` +
      `keyPoints (3-6 concise bullet strings), sources (the URLs from the research), ` +
      `category (best fit), tags (3-6 lowercase keywords).`,
    NOTE_SCHEMA,
  );
}

// ── Reports ────────────────────────────────────────────────────────────────

/** Optional short narrative digest for a report. Returns null on any failure. */
export async function buildDigest(lines: string[], rangeLabel: string): Promise<string | null> {
  if (!client || lines.length === 0) return null;
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content:
            `Write a brief, upbeat 2-3 sentence digest of what I added to my AI knowledge tracker ${rangeLabel}. ` +
            `Group the themes naturally. Items:\n${lines.join("\n")}`,
        },
      ],
    });
    return textOf(res.content).trim() || null;
  } catch {
    return null;
  }
}
