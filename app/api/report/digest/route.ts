import { NextResponse } from "next/server";
import { hasAI, buildDigest } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(request: Request) {
  if (!hasAI) {
    return NextResponse.json({ error: "AI not configured." }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  const lines: string[] = Array.isArray(body?.lines)
    ? body.lines.filter((l: unknown) => typeof l === "string").slice(0, 100)
    : [];
  const rangeLabel = typeof body?.rangeLabel === "string" ? body.rangeLabel : "recently";

  const digest = await buildDigest(lines, rangeLabel);
  return NextResponse.json({ digest });
}
