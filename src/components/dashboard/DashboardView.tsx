"use client";

import * as React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { LocationPicker } from "@/components/dashboard/LocationPicker";
import { PremiumMetrics } from "@/components/dashboard/PremiumMetrics";
import { ProfileSetup } from "@/components/dashboard/ProfileSetup";
import { ExposureEstimate } from "@/components/dashboard/ExposureEstimate";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { NetworkErrorCard } from "@/components/ui/NetworkErrorCard";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useWeather } from "@/hooks/useWeather";
import { DEFAULT_LOCATION, type CoastalLocation } from "@/services/locations";
import type { ActiveSessionState } from "@/utils/sessionTypes";
import type { FitzpatrickSkinType, SunscreenChoice } from "@/utils/sunCalc";
import { calculateSafeExposure } from "@/utils/sunCalc";
import { isZeroUvIndex } from "@/utils/uv";
import { loadSetup, saveActiveSession, saveSetup } from "@/utils/storage";

const DEFAULT_SKIN: FitzpatrickSkinType = 3;
const DEFAULT_SPF: SunscreenChoice = 30;

export function DashboardView() {
  const [location, setLocation] = React.useState<CoastalLocation>(DEFAULT_LOCATION);
  const { status, weather, refresh } = useWeather({
    latitude: location.latitude,
    longitude: location.longitude,
  });

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
  });

  const hasError = status === "error";
  const canStartSession =
    !!weather && !hasError && !calc.noExposure && !isZeroUvIndex(uvIndex);

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
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-500">
          Luxury beach resort tracker
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Good day for the beach
        </h1>
        <p className="text-sm text-slate-500">
          Pick your destination and dial in safe, beautiful time in the sun.
        </p>
      </header>

      <LocationPicker selected={location} onSelect={setLocation} />

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
            {hasError ? (
              <NetworkErrorCard onRetry={refresh} />
            ) : (
              <PremiumMetrics
                status={status}
                weather={weather}
                locationName={`${location.name}, ${location.country}`}
              />
            )}

            <Card>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Begin sunbathing session
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {hasError
                      ? "Reconnect to the internet to start tracking."
                      : calc.noExposure
                        ? "There's no sun to track right now — check back later."
                        : "Live timer, flip reminders and hydration alerts."}
                  </p>
                </div>
                {canStartSession ? (
                  <Link href="/session" onClick={startSession}>
                    <Button variant="gold" className="w-full sm:w-auto">
                      <Play className="size-4" strokeWidth={2} />
                      Start session
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" disabled className="w-full sm:w-auto">
                    {hasError ? "Network error" : calc.noExposure ? "No UV" : "Loading…"}
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
