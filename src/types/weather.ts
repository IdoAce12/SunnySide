/**
 * Session-facing weather snapshot for routing & wait-state UI.
 * `uv_index` mirrors live Open-Meteo readings (0 = no sunbathing).
 */
export interface WeatherData {
  uv_index: number;
  fetched_at: number;
  latitude: number;
  longitude: number;
  air_temp_c?: number;
}

export function weatherDataFromSnapshot(snapshot: {
  uvIndex: number;
  fetchedAt: number;
  latitude: number;
  longitude: number;
  airTempC?: number;
}): WeatherData {
  return {
    uv_index: snapshot.uvIndex,
    fetched_at: snapshot.fetchedAt,
    latitude: snapshot.latitude,
    longitude: snapshot.longitude,
    air_temp_c: snapshot.airTempC,
  };
}
