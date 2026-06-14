import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session-config";

export type { SessionData };

/** Read (or create) the session from the request cookies — server-only. */
export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/** Whether the current request is authenticated. */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session.loggedIn);
}

/** Constant-time-ish comparison of the submitted password against APP_PASSWORD. */
export function checkPassword(submitted: string): boolean {
  const expected = process.env.APP_PASSWORD ?? "";
  if (!expected) return false;
  if (submitted.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= submitted.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
