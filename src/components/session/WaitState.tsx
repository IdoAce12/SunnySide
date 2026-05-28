"use client";

import Link from "next/link";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import type { WeatherData } from "@/types/weather";
import { cn } from "@/utils/cn";

export interface WaitStateProps {
  weatherData: WeatherData;
}

export function WaitState({ weatherData }: WaitStateProps) {
  const lastCheck = new Date(weatherData.fetched_at);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center space-y-8 py-6">
      <header className="w-full space-y-1 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Night mode
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-amber-600/90">
          Wait state
        </h1>
      </header>

      {/* Inactive ring — no progress fill */}
      <div className="relative flex flex-col items-center">
        <div
          className="relative grid size-44 place-items-center rounded-full border border-zinc-800 bg-zinc-950/80 sm:size-52"
          aria-hidden
        >
          <div className="absolute inset-3 rounded-full border border-zinc-800/80" />
          <div
            className={cn(
              "grid size-20 place-items-center rounded-full border border-zinc-800 bg-zinc-900/90",
              "animate-[moon-pulse_3s_ease-in-out_infinite]",
            )}
          >
            <Moon
              className="size-9 text-zinc-500"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        </div>
        <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
          No UV radiation
        </p>
      </div>

      <div className="w-full space-y-3 text-center">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          Sunbathing unavailable
        </h2>
        <p className="text-sm leading-relaxed text-zinc-500">
          The current UV Index is 0. This typically occurs at night or under
          severe conditions. Please wait for the sun to rise and check again.
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="space-y-0 p-0">
          <ConditionRow
            label="Last check"
            value={lastCheck.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
          <ConditionRow label="Sun status" value="Below horizon" />
          <ConditionRow
            label="UV index"
            value={weatherData.uv_index.toFixed(1)}
            mono
          />
        </CardContent>
      </Card>

      <Link href="/" className="w-full">
        <Button variant="primary" className="w-full font-semibold">
          Return to dashboard
        </Button>
      </Link>
    </div>
  );
}

function ConditionRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-3.5 last:border-b-0">
      <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span
        className={cn(
          "text-sm text-zinc-200",
          mono && "font-mono tabular-nums",
        )}
      >
        {value}
      </span>
    </div>
  );
}
