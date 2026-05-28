"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Sun, Timer } from "lucide-react";
import { cn } from "@/utils/cn";

const nav = [
  { href: "/", label: "Beach", icon: Sun },
  { href: "/session", label: "Tracker", icon: Timer },
  { href: "/analytics", label: "Report", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#fdfbf7]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm">
              <Sun className="size-5 text-white" strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight text-slate-900">
                SunnySide
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                Resort tracker
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
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium tracking-wide transition",
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:bg-white/70 hover:text-slate-900",
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-24 sm:pb-10">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200/70 bg-white/90 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-5xl justify-around py-1.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 text-[10px] font-medium uppercase tracking-wider transition",
                  active ? "text-amber-500" : "text-slate-400",
                )}
              >
                <Icon className="size-5" strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
