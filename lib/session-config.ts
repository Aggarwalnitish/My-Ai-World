import type { SessionOptions } from "iron-session";

// Shared session config — safe to import from both edge middleware and
// server components (no next/headers or server-only imports here).

export interface SessionData {
  loggedIn: boolean;
}

// iron-session requires a password of at least 32 characters.
const password =
  process.env.AUTH_SECRET ?? "dev_only_change_me_0123456789abcdef0123456789abcdef";

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "my_ai_world_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  },
};
