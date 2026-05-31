# Eurostat Insights

An interactive, mobile-first **PWA** that turns official **Eurostat** statistics into a
clean, app-store-quality operations dashboard. Built with Next.js 16, TypeScript,
Tailwind CSS v4, Recharts, d3-geo and Framer Motion.

> Educational project for entertainment. **Every figure comes exclusively from
> [Eurostat](https://ec.europa.eu/eurostat)** — no other data sources are used.
> Map geometry is from Eurostat GISCO. © European Union.

## Features

- **Animated landing** + branded splash screen + personalising **onboarding wizard**
  (interests, home country, theme) that tailors the home screen.
- **Personalised home** — greeting, "indicator of the day", favourite metrics and
  per-interest carousels of live KPI cards.
- **3 curated theme dashboards** — Population & Society, Economy & Labour,
  Digital & Innovation — each with KPI stat cards, time-series trends,
  a **choropleth map of Europe** and a country ranking, with focus-country
  selection and a time-range control.
- **Explore** the full Eurostat catalogue (10k+ datasets) with fuzzy search and
  theme filters, plus an **adaptive dataset viewer** that works on *any* dataset:
  auto-detected dimension selectors, time-series chart, Europe comparison map,
  data table and **CSV export**.
- **PWA**: installable, offline app shell + runtime data caching via a hand-written
  service worker, web manifest, maskable + Apple touch icons.
- **Light / dark / system** theme, safe-area aware, reduced-motion friendly,
  accessible, fully responsive.

## Tech stack

| Area        | Choice |
|-------------|--------|
| Framework   | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| Styling     | Tailwind CSS v4 · custom design tokens (OKLCH) |
| Charts      | Recharts (line/area/bar) · d3-geo (Europe choropleth) |
| Motion      | Framer Motion |
| Data        | TanStack Query · Zustand (persisted personalisation) |
| Icons       | lucide-react |

## Data layer

- `app/api/eurostat/data` — caching proxy to the Eurostat dissemination API
  (JSON-stat 2.0), avoids CORS and adds `stale-while-revalidate`.
- `app/api/eurostat/toc` — parses + searches the catalogue table of contents.
- `lib/eurostat/jsonstat.ts` — JSON-stat 2.0 parser + slicing utilities.
- `lib/eurostat/registry.ts` — curated, **API-verified** datasets per theme.

## Develop

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
```

### Scripts

```bash
node scripts/generate-icons.mjs   # regenerate PWA icons from the SVG mark
node scripts/shoot.mjs            # puppeteer screenshots (needs a local Chrome)
```

## Deploy

Any Node host or Vercel. The app is a standard Next.js build; the service worker
and manifest are served from `/public` and `app/manifest.ts`.
