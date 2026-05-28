# SunnySide

Premium sun exposure & hydration performance tracker.

## Stack

- Next.js App Router (TypeScript)
- Tailwind CSS v4
- Lucide React
- Open-Meteo (forecast + marine APIs)
- Supabase (optional session persistence)

## Run

```bash
npm install
npm run dev
```

## Architecture

| Path | Role |
|------|------|
| `src/utils/sunCalc.ts` | MED-based exposure, SPF UVB transmission, mL hydration model |
| `src/hooks/useElapsedTime.ts` | Wall-clock timer + `visibilitychange` resync |
| `src/services/weatherApi.ts` | Open-Meteo client + typed responses |
| `src/components/dashboard/PremiumMetrics.tsx` | Live environmental grid |
| `src/components/session/ActiveTracker.tsx` | Active session with arc progress |
| `src/components/analytics/PerformanceSummary.tsx` | SED & fluid balance reports |

## Supabase (optional)

Copy `.env.local.example` → `.env.local` and create table:

```sql
create table if not exists public.sun_sessions (
  id text primary key,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_minutes int not null,
  water_ml int not null,
  skin_type int not null,
  spf int not null,
  uv_index_avg real not null,
  sed_absorbed real,
  weather_json jsonb not null
);
```
