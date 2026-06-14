import "server-only";
import { prisma, hasDatabase } from "@/lib/db";
import type { Tool, Note } from "@prisma/client";

export type { Tool, Note };

/** All tools, newest first. Returns [] when no DB or on error. */
export async function getTools(): Promise<Tool[]> {
  if (!hasDatabase) return [];
  try {
    return await prisma.tool.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export async function getTool(id: string): Promise<Tool | null> {
  if (!hasDatabase) return null;
  try {
    return await prisma.tool.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function getNotes(): Promise<Note[]> {
  if (!hasDatabase) return [];
  try {
    return await prisma.note.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export async function getNote(id: string): Promise<Note | null> {
  if (!hasDatabase) return null;
  try {
    return await prisma.note.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

/** Tools + notes created on/after `since`. */
export async function getActivitySince(
  since: Date,
  until?: Date,
): Promise<{ tools: Tool[]; notes: Note[] }> {
  if (!hasDatabase) return { tools: [], notes: [] };
  const createdAt = until ? { gte: since, lt: until } : { gte: since };
  try {
    const [tools, notes] = await Promise.all([
      prisma.tool.findMany({ where: { createdAt }, orderBy: { createdAt: "desc" } }),
      prisma.note.findMany({ where: { createdAt }, orderBy: { createdAt: "desc" } }),
    ]);
    return { tools, notes };
  } catch {
    return { tools: [], notes: [] };
  }
}
