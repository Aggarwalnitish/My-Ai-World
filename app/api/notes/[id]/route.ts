import { NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  const { id } = await params;
  await prisma.note.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (typeof body?.userNotes === "string") data.userNotes = body.userNotes;
  if (typeof body?.category === "string") data.category = body.category;
  const note = await prisma.note.update({ where: { id }, data });
  return NextResponse.json({ note });
}
