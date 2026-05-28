/** A selectable global coastal destination. */
export interface CoastalLocation {
  id: string;
  name: string;
  country: string;
  flag: string;
  latitude: number;
  longitude: number;
}

/**
 * Curated coastal destinations. Tel Aviv is the default core fallback and
 * must remain first in the list.
 */
export const COASTAL_LOCATIONS: readonly CoastalLocation[] = [
  {
    id: "tel-aviv",
    name: "Tel Aviv",
    country: "Israel",
    flag: "🇮🇱",
    latitude: 32.0853,
    longitude: 34.7818,
  },
  {
    id: "miami-beach",
    name: "Miami Beach",
    country: "USA",
    flag: "🇺🇸",
    latitude: 25.7907,
    longitude: -80.13,
  },
  {
    id: "ibiza",
    name: "Ibiza",
    country: "Spain",
    flag: "🇪🇸",
    latitude: 38.9067,
    longitude: 1.4206,
  },
  {
    id: "mykonos",
    name: "Mykonos",
    country: "Greece",
    flag: "🇬🇷",
    latitude: 37.4467,
    longitude: 25.3289,
  },
  {
    id: "phuket",
    name: "Phuket",
    country: "Thailand",
    flag: "🇹🇭",
    latitude: 7.8804,
    longitude: 98.3923,
  },
] as const;

/** Tel Aviv — the strict default core fallback. */
export const DEFAULT_LOCATION: CoastalLocation = COASTAL_LOCATIONS[0];

export function findLocationById(id: string): CoastalLocation | undefined {
  return COASTAL_LOCATIONS.find((l) => l.id === id);
}

export function searchLocations(query: string): readonly CoastalLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return COASTAL_LOCATIONS;
  return COASTAL_LOCATIONS.filter(
    (l) =>
      l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q),
  );
}

/** Nearest curated destination to arbitrary coordinates (for geolocation). */
export function nearestLocation(
  latitude: number,
  longitude: number,
): CoastalLocation {
  let best = DEFAULT_LOCATION;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const loc of COASTAL_LOCATIONS) {
    const dLat = loc.latitude - latitude;
    const dLon = loc.longitude - longitude;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < bestDist) {
      bestDist = dist;
      best = loc;
    }
  }
  return best;
}
