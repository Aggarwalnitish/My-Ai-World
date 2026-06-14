import { NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { hasAI, enrichTool } from "@/lib/ai";

// AI research + structuring can take 10-40s — give the function room.
export const maxDuration = 60;

/** Turn raw input into a reasonable display name before enrichment fills it in. */
function deriveName(raw: string): string {
  const trimmed = raw.trim();
  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (trimmed.includes(".") && !trimmed.includes(" ")) {
      return u.hostname.replace(/^www\./, "");
    }
  } catch {
    /* not a URL */
  }
  return trimmed;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasDatabase) return NextResponse.json({ tools: [] });
  const tools = await prisma.tool.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ tools });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasDatabase) {
    return NextResponse.json(
      { error: "Database not configured (set DATABASE_URL)." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const rawInput = typeof body?.rawInput === "string" ? body.rawInput.trim() : "";
  const userNote = typeof body?.userNote === "string" ? body.userNote.trim() : "";
  if (!rawInput) {
    return NextResponse.json({ error: "Please enter a tool name or link." }, { status: 400 });
  }

  const isUrl = /^https?:\/\//i.test(rawInput) || /\.[a-z]{2,}($|\/)/i.test(rawInput);

  // Create immediately so nothing is lost even if enrichment fails.
  let tool = await prisma.tool.create({
    data: {
      rawInput,
      name: deriveName(rawInput),
      url: isUrl ? (rawInput.startsWith("http") ? rawInput : `https://${rawInput}`) : null,
      userNote: userNote || null,
      status: hasAI ? "processing" : "ready",
    },
  });

  if (hasAI) {
    try {
      const enriched = await enrichTool(rawInput);
      if (enriched) {
        tool = await prisma.tool.update({
          where: { id: tool.id },
          data: {
            name: enriched.name || tool.name,
            url: enriched.url || tool.url,
            summary: enriched.summary,
            details: enriched.details,
            category: enriched.category || "Other",
            tags: enriched.tags ?? [],
            status: "ready",
          },
        });
      } else {
        tool = await prisma.tool.update({
          where: { id: tool.id },
          data: { status: "failed" },
        });
      }
    } catch (err) {
      console.error("enrichTool failed:", err);
      tool = await prisma.tool.update({
        where: { id: tool.id },
        data: { status: "failed" },
      });
    }
  }

  return NextResponse.json({ tool });
}
