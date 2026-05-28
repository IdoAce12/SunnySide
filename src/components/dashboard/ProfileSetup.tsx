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
        <CardTitle>Your skin profile</CardTitle>
        <CardDescription>
          Fitzpatrick classification &amp; UVB attenuation via sunscreen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <User className="size-3.5" strokeWidth={2} />
            Skin phototype
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SKIN_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ skinType: t, spf })}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition",
                  t === skinType
                    ? "border-amber-300 bg-amber-50 ring-1 ring-amber-200"
                    : "border-stone-200 bg-white hover:border-sky-200 hover:bg-sky-50/40",
                )}
              >
                <div className="text-sm font-semibold text-slate-900">Type {t}</div>
                <div className="mt-0.5 text-xs leading-snug text-slate-500">
                  {getSkinTypeLabel(t).replace(/^Type [IVX]+ — /, "")}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Shield className="size-3.5" strokeWidth={2} />
            Sunscreen
          </div>
          <div className="flex flex-wrap gap-2">
            {SPF_CHOICES.map((choice) => (
              <button
                key={String(choice)}
                type="button"
                onClick={() => onChange({ skinType, spf: choice })}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm transition",
                  choice === spf
                    ? "border-amber-300 bg-amber-50 text-slate-900 ring-1 ring-amber-200"
                    : "border-stone-200 bg-white text-slate-500 hover:border-sky-200 hover:bg-sky-50/40",
                )}
              >
                <span className="font-semibold">{sunscreenLabel(choice)}</span>
                {choice !== "none" ? (
                  <span className="ml-1.5 text-xs text-slate-400">
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
