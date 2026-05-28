"use client";

import * as React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { PremiumMetrics } from "@/components/dashboard/PremiumMetrics";
import { ProfileSetup } from "@/components/dashboard/ProfileSetup";
import { ExposureEstimate } from "@/components/dashboard/ExposureEstimate";
import { OfflineBanner } from "@/components/dashboard/OfflineBanner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useWeather } from "@/hooks/useWeather";
import type { ActiveSessionState } from "@/utils/sessionTypes";
import type { FitzpatrickSkinType, SunscreenChoice } from "@/utils/sunCalc";
import { calculateSafeExposure } from "@/utils/sunCalc";
import { isZeroUvIndex } from "@/utils/uv";
import { loadSetup, saveActiveSession, saveSetup } from "@/utils/storage";

const DEFAULT_SKIN: FitzpatrickSkinType = 3;
const DEFAULT_SPF: SunscreenChoice = 30;

export function DashboardView() {
  const { status, weather, error, isOffline, refresh } = useWeather();
  const [setup, setSetup] = React.useState<{
    skinType: FitzpatrickSkinType;
    spf: SunscreenChoice;
  }>(() => loadSetup() ?? { skinType: DEFAULT_SKIN, spf: DEFAULT_SPF });

  React.useEffect(() => {
    saveSetup(setup);
  }, [setup]);

  const uvIndex = weather?.uvIndex ?? 0;
  const calc = calculateSafeExposure({
    skinType: setup.skinType,
    spf: setup.spf,
    uvIndex,
    isOffline,
  });

  const canStartSession =
    weather && !calc.noExposure && !isZeroUvIndex(uvIndex) && !isOffline;

  const startSession = () => {
    if (!weather || !canStartSession) return;
    const active: ActiveSessionState = {
      startedAt: Date.now(),
      flipIntervalMinutes: 15,
      waterMlLogged: 0,
      weatherAtStart: weather,
      setup,
    };
    saveActiveSession(active);
  };

  return (
    <div className="space-y-8">
      {isOffline ? <OfflineBanner /> : null}

      <header className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Performance tracker • Tel Aviv default
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Command center</h1>
      </header>

      <ErrorBoundary>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <ProfileSetup
              skinType={setup.skinType}
              spf={setup.spf}
              onChange={setSetup}
            />
            <ExposureEstimate
              skinType={setup.skinType}
              spf={setup.spf}
              uvIndex={uvIndex}
              calc={calc}
            />
          </div>

          <div className="space-y-6 lg:col-span-7">
            <PremiumMetrics
              status={status}
              weather={weather}
              errorMessage={error?.message}
              onRetry={refresh}
            />

            <Card>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-200">Begin exposure session</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {calc.noExposure
                      ? "Session unavailable until UV rises above 0."
                      : "Timestamp-locked timer • MED-based limits • mL hydration"}
                  </p>
                </div>
                {canStartSession ? (
                  <Link href="/session" onClick={startSession}>
                    <Button variant="gold" className="w-full sm:w-auto">
                      <Play className="size-4" strokeWidth={1.75} />
                      Start session
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" disabled className="w-full sm:w-auto">
                    {isOffline
                      ? "Offline"
                      : calc.noExposure
                        ? "No UV"
                        : "Awaiting weather"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
