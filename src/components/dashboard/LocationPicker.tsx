"use client";

import * as React from "react";
import { Check, Loader2, MapPin, Navigation, Search } from "lucide-react";
import {
  COASTAL_LOCATIONS,
  nearestLocation,
  searchLocations,
  type CoastalLocation,
} from "@/services/locations";
import { requestGeolocation } from "@/utils/geolocation";
import { cn } from "@/utils/cn";

interface LocationPickerProps {
  selected: CoastalLocation;
  onSelect: (location: CoastalLocation) => void;
}

export function LocationPicker({ selected, onSelect }: LocationPickerProps) {
  const [query, setQuery] = React.useState("");
  const [locating, setLocating] = React.useState(false);
  const [geoNote, setGeoNote] = React.useState<string | null>(null);

  const results = searchLocations(query);

  const detectLocation = async () => {
    setLocating(true);
    setGeoNote(null);
    const outcome = await requestGeolocation(8000);
    setLocating(false);

    if (outcome.ok && outcome.coords) {
      const match = nearestLocation(
        outcome.coords.latitude,
        outcome.coords.longitude,
      );
      onSelect(match);
      setGeoNote(`Nearest resort: ${match.name}`);
      return;
    }

    const reasonText =
      outcome.reason === "denied"
        ? "Location access denied — using your selection."
        : outcome.reason === "timeout"
          ? "Location timed out — using your selection."
          : outcome.reason === "offline"
            ? "Offline — using your selection."
            : "Location unavailable — using your selection.";
    setGeoNote(reasonText);
  };

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
            <MapPin className="size-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">
              Beach destination
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {selected.flag} {selected.name}, {selected.country}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-stone-100 disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <Navigation className="size-3.5" strokeWidth={2} />
          )}
          {locating ? "Locating…" : "Use my location"}
        </button>
      </div>

      <div className="mt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a beach or region…"
            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(query ? results : COASTAL_LOCATIONS).map((loc) => {
          const active = loc.id === selected.id;
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => {
                onSelect(loc);
                setGeoNote(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-stone-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50",
              )}
            >
              <span aria-hidden>{loc.flag}</span>
              {loc.name}
              {active ? <Check className="size-3" strokeWidth={2.5} /> : null}
            </button>
          );
        })}
        {query && results.length === 0 ? (
          <span className="px-1 py-1.5 text-xs text-slate-400">
            No destinations match “{query}”.
          </span>
        ) : null}
      </div>

      {geoNote ? (
        <p className="mt-3 text-[11px] text-slate-400">{geoNote}</p>
      ) : null}
    </div>
  );
}
