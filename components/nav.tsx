"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Lightbulb,
  BarChart3,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/notes", label: "Learnings", icon: Lightbulb },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <Link href="/" className="flex items-center gap-2 px-2 py-3">
        <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)] text-white grid place-items-center">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="font-semibold">My AI World</span>
      </Link>

      <div className="mt-2 flex flex-col gap-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-foreground)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </nav>
  );
}
