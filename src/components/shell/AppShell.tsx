"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Sun, Timer } from "lucide-react";
import { cn } from "@/utils/cn";

const nav = [
  { href: "/", label: "Command", icon: Sun },
  { href: "/session", label: "Tracker", icon: Timer },
  { href: "/analytics", label: "Report", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg border border-amber-900/40 bg-amber-950/40">
              <Sun className="size-4 text-amber-600/90" strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-zinc-50">
                SunnySide
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide transition",
                    active
                      ? "bg-zinc-900 text-zinc-100"
                      : "text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300",
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-24 sm:pb-8">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800 bg-slate-950/95 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-5xl justify-around py-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 text-[10px] font-medium uppercase tracking-wider",
                  active ? "text-amber-600/90" : "text-zinc-500",
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
