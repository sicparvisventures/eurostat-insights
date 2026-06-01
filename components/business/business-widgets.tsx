"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type {
  DaypartForecast,
  DayForecast,
  HourPoint,
  LocationForecast,
} from "@/lib/business/forecast";
import type { WeatherDay } from "@/lib/business/context";
import { cn } from "@/lib/utils";

export const eur = (v: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);

const eur1 = (v: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 1,
  }).format(v);

export function SectionTitle({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-semibold tracking-tight">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium"
        >
          View <Icon name="ChevronRight" className="size-4" />
        </Link>
      )}
    </div>
  );
}

export function DemandPill({ band }: { band: string }) {
  const tone =
    band === "hotspot" || band === "busy"
      ? "bg-success/15 text-success"
      : band === "normal"
        ? "bg-muted text-muted-foreground"
        : "bg-warning/15 text-warning";
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold capitalize",
        tone,
      )}
    >
      {band}
    </span>
  );
}

export function DeltaText({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const tone =
    value > 0 ? "text-success" : value < 0 ? "text-danger" : "text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums",
        tone,
        className,
      )}
    >
      <Icon
        name={value > 0 ? "ArrowUpRight" : value < 0 ? "ArrowDownRight" : "ArrowRight"}
        className="size-3"
      />
      {value > 0 ? "+" : ""}
      {value}% vs normal
    </span>
  );
}

export function ForecastHero({
  title,
  subtitle,
  forecast,
  briefing,
}: {
  title: string;
  subtitle: string;
  forecast: LocationForecast;
  briefing?: string;
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
            {subtitle}
          </p>
          <div className="mt-2 flex items-end gap-3">
            <h1 className="text-4xl font-bold tracking-tight tabular-nums">
              {eur(forecast.revenue)}
            </h1>
            <DeltaText value={forecast.deltaVsNormalPct} className="mb-1.5" />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {title} · {forecast.covers} covers · {eur1(forecast.avgTicket)} avg
            ticket
          </p>
        </div>
        <DemandPill band={forecast.demandBand} />
      </div>

      <div className="bg-muted mb-1 h-2 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${forecast.demand}%` }}
        />
      </div>
      <p className="text-muted-foreground mb-4 text-xs">
        Demand {forecast.demand}/100 · confidence {forecast.confidence}%
      </p>

      {briefing && (
        <p className="text-foreground/90 text-sm leading-relaxed">{briefing}</p>
      )}
    </section>
  );
}

export interface KpiItem {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad";
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
      {items.map((kpi) => (
        <Card key={kpi.label} className="p-4">
          <p className="text-muted-foreground text-xs font-medium">
            {kpi.label}
          </p>
          <p className="mt-2 text-xl font-bold tracking-tight tabular-nums">
            {kpi.value}
          </p>
          {kpi.sub && (
            <p
              className={cn(
                "mt-1 text-xs",
                kpi.tone === "good"
                  ? "text-success"
                  : kpi.tone === "bad"
                    ? "text-danger"
                    : "text-muted-foreground",
              )}
            >
              {kpi.sub}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

export function DaypartBars({ dayparts }: { dayparts: DaypartForecast[] }) {
  return (
    <div className="space-y-3">
      {dayparts.map((dp) => (
        <Card key={dp.id} className="p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{dp.label}</p>
              <p className="text-muted-foreground text-xs">{dp.window}</p>
            </div>
            <p className="text-lg font-bold tabular-nums">{eur(dp.revenue)}</p>
          </div>
          <div className="bg-muted mb-3 h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${dp.demand}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <MiniStat label="Covers" value={`${dp.covers}`} />
            <MiniStat label="Staff" value={`${dp.laborHours}h`} />
            <MiniStat label="Labour" value={`${(dp.laborRatio * 100).toFixed(1)}%`} />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function HourlyCurve({ hourly }: { hourly: HourPoint[] }) {
  const max = Math.max(...hourly.map((h) => h.revenue), 1);
  return (
    <Card className="p-4">
      <div className="space-y-2">
        {hourly.map((h) => (
          <div
            key={h.hour}
            className="grid grid-cols-[44px_1fr_64px] items-center gap-3 text-sm"
          >
            <span className="text-muted-foreground font-mono text-xs">
              {h.hour}
            </span>
            <div className="bg-muted h-2.5 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${Math.max((h.revenue / max) * 100, 3)}%` }}
              />
            </div>
            <span className="text-right font-semibold tabular-nums">
              {eur(h.revenue)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function WeekBars({
  week,
  budgetPerOpenDay,
}: {
  week: DayForecast[];
  budgetPerOpenDay?: number;
}) {
  const max = Math.max(
    ...week.map((d) => Math.max(d.revenue, d.baseline)),
    budgetPerOpenDay ?? 0,
    1,
  );
  return (
    <Card className="p-4">
      <div className="flex items-end justify-between gap-1.5" style={{ height: 140 }}>
        {week.map((d) => (
          <div key={d.weekday} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex w-full flex-1 items-end justify-center">
              {d.open && (
                <div
                  className="bg-muted-foreground/20 absolute bottom-0 w-full max-w-7 rounded-t-md"
                  style={{ height: `${(d.baseline / max) * 100}%` }}
                  title={`${d.weekday} baseline: ${eur(d.baseline)}`}
                />
              )}
              <div
                className={cn(
                  "relative w-full max-w-7 rounded-t-md transition-all",
                  d.isFocus
                    ? "bg-primary"
                    : d.open
                      ? "bg-primary/35"
                      : "bg-muted",
                )}
                style={{ height: `${(d.revenue / max) * 100}%` }}
                title={`${d.weekday}: ${eur(d.revenue)}`}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium",
                d.isFocus ? "text-primary" : "text-muted-foreground",
              )}
            >
              {d.weekday}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BudgetProgress({
  target,
  forecast,
  deltaPct,
}: {
  target: number;
  forecast: number;
  deltaPct: number;
}) {
  const pct = target ? Math.min(140, Math.round((forecast / target) * 100)) : 0;
  const gap = forecast - target;
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-semibold">Weekly outlook</p>
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            deltaPct > 0
              ? "text-success"
              : deltaPct < 0
                ? "text-danger"
                : "text-muted-foreground",
          )}
        >
          {deltaPct > 0 ? "+" : ""}
          {deltaPct}% vs baseline
        </p>
      </div>
      <div className="bg-muted relative h-3 overflow-hidden rounded-full">
        <div
          className="bg-muted-foreground/25 absolute inset-y-0 left-0 w-full rounded-full"
        />
        <div
          className="bg-primary absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <MiniStat label="Forecast wk" value={eur(forecast)} />
        <MiniStat label="Baseline" value={eur(target)} />
        <MiniStat label="Gap" value={eur(gap)} />
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        Baseline is your setup estimate; today includes weather and event context.
      </p>
    </Card>
  );
}

export function ShiftLaborBars({ forecast }: { forecast: LocationForecast }) {
  const rows = [
    {
      label: "Day total",
      revenue: forecast.revenue,
      laborCost: forecast.laborCost,
      ratio: forecast.laborRatio,
    },
    ...forecast.dayparts
      .filter((d) => d.id !== "late")
      .map((d) => ({
        label: d.label,
        revenue: d.revenue,
        laborCost: d.laborCost,
        ratio: d.laborRatio,
      })),
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const laborPct = r.revenue ? (r.laborCost / r.revenue) * 100 : 0;
        return (
          <Card key={r.label} className="p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-semibold">{r.label}</p>
              <p className="text-sm tabular-nums">{eur(r.revenue)}</p>
            </div>
            <div className="bg-muted flex h-3 overflow-hidden rounded-full">
              <div
                className="bg-danger/70 h-full"
                style={{ width: `${laborPct}%` }}
                title={`Labour ${eur(r.laborCost)}`}
              />
              <div className="bg-primary h-full flex-1" title="After labour" />
            </div>
            <div className="text-muted-foreground mt-2 flex justify-between text-xs">
              <span>Labour {eur(r.laborCost)} · {(r.ratio * 100).toFixed(1)}%</span>
              <span>After labour {eur(r.revenue - r.laborCost)}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function WeatherStrip({ weather }: { weather: WeatherDay | null }) {
  if (!weather) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground text-sm">Weather unavailable.</p>
      </Card>
    );
  }
  const icon =
    weather.precipitation > 3
      ? "CloudRain"
      : weather.precipitation > 0.3
        ? "Umbrella"
        : weather.tempMax >= 20
          ? "Sun"
          : "CloudSun";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-xl">
          <Icon name={icon} className="size-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{weather.summary}</p>
          <p className="text-muted-foreground text-sm">
            {Math.round(weather.tempMin)}° / {Math.round(weather.tempMax)}° ·{" "}
            {weather.precipitation.toFixed(1)} mm · wind{" "}
            {Math.round(weather.windSpeed)} km/h
          </p>
        </div>
      </div>
    </Card>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-[10px] uppercase">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}
