"use client";

import { Shield, User } from "lucide-react";
import type { FitzpatrickSkinType, SunscreenChoice } from "@/utils/sunCalc";
import {
  getSkinTypeLabel,
  getSpfBlockPercent,
  sunscreenLabel,
} from "@/utils/sunCalc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

const SKIN_TYPES: FitzpatrickSkinType[] = [1, 2, 3, 4, 5, 6];
const SPF_CHOICES: SunscreenChoice[] = ["none", 15, 30, 50];

export function ProfileSetup({
  skinType,
  spf,
  onChange,
}: {
  skinType: FitzpatrickSkinType;
  spf: SunscreenChoice;
  onChange: (next: { skinType: FitzpatrickSkinType; spf: SunscreenChoice }) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Physiological profile</CardTitle>
        <CardDescription>
          Fitzpatrick classification &amp; UVB attenuation via sunscreen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-zinc-500">
            <User className="size-3.5" strokeWidth={1.75} />
            Skin phototype
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SKIN_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ skinType: t, spf })}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left transition",
                  t === skinType
                    ? "border-amber-800/60 bg-amber-950/30"
                    : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700",
                )}
              >
                <div className="text-sm font-medium text-zinc-100">Type {t}</div>
                <div className="mt-0.5 text-xs leading-snug text-zinc-500">
                  {getSkinTypeLabel(t).replace(/^Type [IVX]+ — /, "")}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-zinc-500">
            <Shield className="size-3.5" strokeWidth={1.75} />
            Sunscreen
          </div>
          <div className="flex flex-wrap gap-2">
            {SPF_CHOICES.map((choice) => (
              <button
                key={String(choice)}
                type="button"
                onClick={() => onChange({ skinType, spf: choice })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition",
                  choice === spf
                    ? "border-amber-800/60 bg-amber-950/30 text-zinc-100"
                    : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700",
                )}
              >
                <span className="font-medium">{sunscreenLabel(choice)}</span>
                {choice !== "none" ? (
                  <span className="ml-1.5 text-xs text-zinc-500">
                    {getSpfBlockPercent(choice)}% UVB
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
