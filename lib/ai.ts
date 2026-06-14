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

// Web search only (no web_fetch — full-page fetches are the biggest token cost;
// search snippets are enough for crisp summaries). `allowed_callers: ["direct"]`
// disables programmatic tool calling, which Haiku 4.5 doesn't support.
// `max_uses` caps the number of searches (each search is billed).
const WEB_TOOLS = [
  {
    type: "web_search_20260209",
    name: "web_search",
    allowed_callers: ["direct"],
    max_uses: 3,
  },
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
    max_tokens: 1200,
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
    max_tokens: 700,
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
    `Research this AI tool and report concisely.\n` +
      `Tool (name or URL): ${rawInput}\n` +
      `Use web search to find the official site and what it does. In under 80 words give: ` +
      `official name, homepage URL, what it does, who it's for, and pricing if known. ` +
      `End with a line "SOURCES:" listing the URLs used.`,
  );

  return structure<EnrichedTool>(
    `Turn the research below into compact catalog data.\n` +
      `Pick the single best category (invent a short new one only if none fit): ${CATEGORIES.join(", ")}\n\n` +
      `Input: ${rawInput}\nResearch:\n${findings}\n\n` +
      `Return JSON: name (official name); url (homepage or ""); ` +
      `summary (ONE crisp sentence, max ~18 words); details (1-2 short sentences, max ~40 words); ` +
      `category; tags (3-5 lowercase keywords).`,
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
  // Feed the user's notes into the SEARCH step so research is guided by both the
  // concept and the angle they care about — much better for niche/personal topics.
  const notesForResearch = userNotes
    ? `\nThe user's own notes describe the specific angle they care about — use them to focus your web searches:\n"${userNotes}"`
    : "";

  const findings = await research(
    `Research and explain this concept concisely: "${title}".${notesForResearch}\n` +
      `Use web search for authoritative, current info, prioritizing what's most relevant to the user's angle above. ` +
      `In under 120 words cover what it is, why it matters, and the key points. ` +
      `End with a line "SOURCES:" listing the URLs used.`,
  );

  const notesContext = userNotes
    ? ` The user's own note (context only, don't copy it): ${userNotes}`
    : "";

  return structure<EnrichedNote>(
    `Turn the research below into compact data about "${title}".${notesContext}\n` +
      `Pick the single best category (invent a short new one only if none fit): ${CATEGORIES.join(", ")}\n\n` +
      `Research:\n${findings}\n\n` +
      `Return JSON: aiSummary (a tight explainer in markdown, max ~120 words, 1-2 short paragraphs); ` +
      `keyPoints (3-4 short bullets); sources (URLs from the research); ` +
      `category; tags (3-5 lowercase keywords).`,
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
      max_tokens: 250,
      messages: [
        {
          role: "user",
          content:
            `Write a crisp, upbeat 2-sentence digest of what I added to my AI tracker ${rangeLabel}. ` +
            `Group the themes naturally. Items:\n${lines.join("\n")}`,
        },
      ],
    });
    return textOf(res.content).trim() || null;
  } catch {
    return null;
  }
}
