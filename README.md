# Statera — The measure of Europe

**Live app:** [https://eurostat-insights.vercel.app/](https://eurostat-insights.vercel.app/)

Interactive, mobile-first **PWA** that turns official **Eurostat** statistics into a clean operations dashboard — plus a **Business Mode** hospitality forecast for restaurants and hotels. Built with Next.js 16, TypeScript, Tailwind CSS v4, Recharts, d3-geo and Framer Motion.

> Educational project. **Statistics come from [Eurostat](https://ec.europa.eu/eurostat)**; map geometry from Eurostat GISCO. Business forecasts combine your venue configuration with **Open-Meteo** weather and Eurostat tourism seasonality. © European Union.

## What it is

**Statera** (*stah-TEH-rah*, Latin for balance) reads Europe through official numbers and makes them legible:

| Mode | Audience | What you get |
|------|----------|--------------|
| **Consumer** | Anyone curious about Europe | Personalised home, four theme dashboards, catalogue explorer |
| **Business** | Hospitality operators | Multi-location setup, demand forecast, labour hints, weather-aware signals |

The repo folder is still named `eurostat-insights`; the product brand is **Statera**.

## Features

### Consumer

- **Landing** with Consumer / Business toggle, animated hero and live EU KPI teasers.
- **Onboarding** — interests, home country, light/dark theme; tailors the home screen.
- **Personalised home** — greeting, indicator of the day, favourites and per-interest KPI carousels.
- **Four curated theme dashboards** — Population & Society, Economy & Labour, Digital & Innovation, Hospitality & Tourism — each with stat cards, time-series trends, a **choropleth map of Europe**, country ranking, focus-country selection and time-range control.
- **Explore** — fuzzy search over 10k+ Eurostat datasets, theme filters, and an **adaptive dataset viewer** (auto dimension selectors, chart, map, table, **CSV export**).
- **PWA** — installable, offline app shell, hand-written service worker, web manifest, maskable icons.
- **Light / dark / system**, safe-area aware, reduced-motion friendly, accessible, responsive (mobile-first with a desktop shell).

### Business Mode

- **Onboarding** for venue type, capacity, price tier and locations (Belgium-focused map today).
- **Forecast engine** — deterministic revenue, covers, dayparts, hourly curve, week pattern and labour read from location config plus modifiers (weather, tourism season from Eurostat, events).
- **Pages:** home overview, weekly forecast, locations, signals (sources & rhythm), settings.
- **Weather** via `/api/weather` → [Open-Meteo](https://open-meteo.com/) (geocoding + forecast, cached).

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 · OKLCH design tokens |
| Charts & maps | Recharts · d3-geo · TopoJSON Europe |
| Motion | Framer Motion |
| Data | TanStack Query · Zustand (persisted personalisation & business config) |
| Icons | lucide-react |

## Data layer

| Route / module | Role |
|----------------|------|
| `app/api/eurostat/data` | Caching proxy to Eurostat dissemination API (JSON-stat 2.0), CORS-safe, `stale-while-revalidate` |
| `app/api/eurostat/toc` | Catalogue table of contents — parse & search |
| `app/api/weather` | Open-Meteo proxy for Business Mode |
| `lib/eurostat/jsonstat.ts` | JSON-stat 2.0 parser & slicing |
| `lib/eurostat/registry.ts` | Curated, API-verified datasets per theme |
| `lib/eurostat/catalog.ts` | Full TOC search helpers |
| `lib/business/forecast.ts` | Config-driven hospitality forecast |

## Project layout

```
app/
  (app)/          # Consumer shell: home, topics, explore, dataset viewer, settings
  business/       # Business shell: home, forecast, locations, signals, onboarding
  api/            # Eurostat + weather proxies
components/       # UI, charts, maps, landing, business widgets
lib/              # Eurostat client, registry, business logic, brand tokens
public/           # PWA assets, Europe GeoJSON, topic imagery
docs/             # Research & planning notes (catalog map, business mode, responsive shell)
```

## Develop

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
pnpm lint
```

### Scripts

```bash
node scripts/generate-icons.mjs   # regenerate PWA icons from the SVG mark
node scripts/shoot.mjs            # Puppeteer screenshots (needs local Chrome)
```

## Deploy

Works on any Node host or [Vercel](https://vercel.com/). Standard `next build`; service worker and manifest from `/public` and `app/manifest.ts`. Production deployment: [eurostat-insights.vercel.app](https://eurostat-insights.vercel.app/).

## Attribution

- Data © [European Union](https://ec.europa.eu/eurostat), 1995–2026 — Eurostat.
- Weather © [Open-Meteo](https://open-meteo.com/).
- Crafted by **Artemid Labs**.

## Docs

- [`docs/eurostat-catalog-map.md`](docs/eurostat-catalog-map.md) — catalogue structure & search strategy
- [`docs/hospitality-business-mode-research.md`](docs/hospitality-business-mode-research.md) — Business Mode product research
- [`docs/desktop-responsive-shell-plan.md`](docs/desktop-responsive-shell-plan.md) — desktop layout plan
