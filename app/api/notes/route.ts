import { NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { hasAI, explainConcept } from "@/lib/ai";

export const maxDuration = 60;

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasDatabase) return NextResponse.json({ notes: [] });
  const notes = await prisma.note.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ notes });
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
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const userNotes = typeof body?.userNotes === "string" ? body.userNotes.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Please enter what you learned." }, { status: 400 });
  }

  let note = await prisma.note.create({
    data: {
      title,
      userNotes: userNotes || null,
      status: hasAI ? "processing" : "ready",
    },
  });

  if (hasAI) {
    try {
      const enriched = await explainConcept(title, userNotes || undefined);
      if (enriched) {
        note = await prisma.note.update({
          where: { id: note.id },
          data: {
            aiSummary: enriched.aiSummary,
            keyPoints: enriched.keyPoints ?? [],
            sources: enriched.sources ?? [],
            category: enriched.category || "Other",
            tags: enriched.tags ?? [],
            status: "ready",
          },
        });
      } else {
        note = await prisma.note.update({
          where: { id: note.id },
          data: { status: "failed" },
        });
      }
    } catch (err) {
      console.error("explainConcept failed:", err);
      note = await prisma.note.update({
        where: { id: note.id },
        data: { status: "failed" },
      });
    }
  }

  return NextResponse.json({ note });
}
