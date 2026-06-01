"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipBar } from "@/components/ui/chip-bar";
import { Icon } from "@/components/ui/icon";
import {
  SectionTitle,
  WeatherStrip,
} from "@/components/business/business-widgets";
import {
  dateFromInput,
  ForecastDateControl,
  todayInputValue,
} from "@/components/business/forecast-date-control";
import { BUSINESS_SIGNAL_SOURCES, SOURCE_HEALTH } from "@/lib/business/signals";
import {
  useBusinessHasHydrated,
  useBusinessStore,
} from "@/lib/store/business";
import { useBusinessContext } from "@/lib/business/context";
import { useGroupForecast, useLocationForecast } from "@/lib/business/use-forecast";
import { cn } from "@/lib/utils";

type SignalScope = "all" | string;

export default function BusinessSignalsPage() {
  const hydrated = useBusinessHasHydrated();
  const group = useBusinessStore((s) => s.group);
  const locations = useBusinessStore((s) => s.locations);
  const activeId = useBusinessStore((s) => s.activeLocationId);
  const setActive = useBusinessStore((s) => s.setActiveLocation);
  const [scope, setScope] = useState<SignalScope>("all");
  const [forecastDate, setForecastDate] = useState(() => todayInputValue());
  const focusDate = dateFromInput(forecastDate);
  const active =
    scope === "all"
      ? null
      : (locations.find((location) => location.id === scope) ??
        locations.find((location) => location.id === activeId) ??
        locations[0] ??
        null);
  const ctx = useBusinessContext(active?.country ?? group.country);
  const { forecast, weather } = useLocationForecast(active, {
    date: focusDate,
    applyToWeek: true,
  });
  const groupForecast = useGroupForecast(locations, ctx.seasonIndex, focusDate, {
    applyToWeek: true,
  });

  if (!hydrated) return null;
  if (!locations.length) {
    return (
      <div className="px-5 pt-16 text-center">
        <p className="text-muted-foreground">No location configured yet.</p>
        <Button asChild className="mt-4">
          <Link href="/business/onboarding">
            Set up <Icon name="ArrowRight" />
          </Link>
        </Button>
      </div>
    );
  }

  const weatherDay = weather.data?.days.find((d) => d.date === forecastDate) ?? weather.data?.today;
  const aggregateModifiers = groupForecast.byLocation.length
    ? {
        weather: null,
        season: Math.round((ctx.seasonIndex - 1) * 100),
        weekday: Math.round(
          groupForecast.byLocation.reduce(
            (sum, row) => sum + row.forecast.modifiers.weekday,
            0,
          ) / groupForecast.byLocation.length,
        ),
        event: Math.round(
          groupForecast.byLocation.reduce(
            (sum, row) => sum + row.forecast.modifiers.event,
            0,
          ) / groupForecast.byLocation.length,
        ),
      }
    : { weather: null, season: 0, weekday: 0, event: 0 };
  const activeForecast = scope === "all" ? null : forecast;
  const modifiers = activeForecast?.modifiers ?? aggregateModifiers;
  const signals = [
    {
      name: "Weather effect",
      value: modifiers.weather,
      unit: "% demand",
      explanation:
        scope === "all"
          ? "Portfolio weather is evaluated per city. Select a location to see the Open-Meteo forecast for that site."
          : weatherDay
            ? `${weatherDay.summary}, ${Math.round(weatherDay.tempMax)}° and ${weatherDay.precipitation.toFixed(1)} mm shape terrace and walk-in.`
            : "Live weather unavailable for this city.",
    },
    {
      name: "Tourism season",
      value: modifiers.season,
      unit: "% demand",
      explanation: `${ctx.seasonLabel} — derived from Eurostat hotel-nights seasonality for ${active?.country ?? group.country}.`,
    },
    {
      name: "Weekday pattern",
      value: modifiers.weekday,
      unit: "% demand",
      explanation: "Typical hospitality weekday rhythm versus the weekly average.",
    },
    {
      name: "Event spillover",
      value: modifiers.event,
      unit: "% demand",
      explanation: "Simulated nearby event gravity. Connect Ticketmaster/UiT for live events.",
    },
    {
      name: "Dining inflation",
      value: ctx.cateringInflation,
      unit: "% y/y",
      explanation: "Eurostat HICP catering price pressure (CP111) — pricing context.",
      pricing: true,
    },
  ];

  return (
    <div>
      <AppHeader
        title="Signals"
        subtitle={
          scope === "all"
            ? `${locations.length} locations · portfolio demand drivers`
            : `${active?.name ?? "Location"} · live demand drivers`
        }
        homeHref="/business/home"
      />

      <div className="space-y-7 px-5 pt-2">
        <ChipBar
          ariaLabel="Signal scope"
          value={scope}
          onChange={(value) => {
            setScope(value);
            if (value !== "all") setActive(value);
          }}
          options={[
            { value: "all", label: "All locations" },
            ...locations.map((l) => ({ value: l.id, label: l.name })),
          ]}
        />
        <ForecastDateControl
          value={forecastDate}
          onChange={setForecastDate}
          compact
        />

        <section>
          <SectionTitle title="Forecast-week demand drivers" />
          <div className="divide-border overflow-hidden rounded-2xl border bg-card">
            {signals.map((s) => (
              <div key={s.name} className="border-border border-b p-4 last:border-0">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <p className="font-semibold leading-tight">{s.name}</p>
                  <SignalValue value={s.value} pricing={s.pricing} />
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {s.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="Forecast-week location signals" />
          {scope === "all" ? (
            <PortfolioSignalTable locations={groupForecast.byLocation} />
          ) : weather.data?.days?.length ? (
            <Card className="divide-border divide-y p-0">
              {weather.data.days.slice(0, 7).map((d) => (
                <div
                  key={d.date}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="text-muted-foreground w-20 font-medium">
                    {new Date(d.date).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex-1">{d.summary}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {d.precipitation.toFixed(1)} mm
                  </span>
                  <span className="w-16 text-right font-semibold tabular-nums">
                    {Math.round(d.tempMin)}°/{Math.round(d.tempMax)}°
                  </span>
                </div>
              ))}
            </Card>
          ) : (
            <WeatherStrip weather={null} />
          )}
        </section>

        <section>
          <SectionTitle title="Connectors" />
          <div className="space-y-2.5">
            {BUSINESS_SIGNAL_SOURCES.map((source) => {
              const health = SOURCE_HEALTH.find((h) =>
                h.source.toLowerCase().includes(source.title.split(" ")[0].toLowerCase()),
              );
              return (
                <Card key={source.id} className="flex items-center gap-3 p-3.5">
                  <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon name={source.icon} className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">
                      {source.title}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {source.description}
                    </p>
                  </div>
                  <StatusDot status={health?.status ?? "ok"} />
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function SignalValue({
  value,
  pricing,
}: {
  value: number | null;
  pricing?: boolean;
}) {
  if (value == null) return <span className="text-muted-foreground text-sm">—</span>;
  const tone = pricing
    ? value > 0
      ? "text-warning"
      : "text-muted-foreground"
    : value > 0
      ? "text-success"
      : value < 0
        ? "text-danger"
        : "text-muted-foreground";
  return (
    <span className={cn("text-lg font-bold tabular-nums", tone)}>
      {value > 0 ? "+" : ""}
      {value}
      {pricing ? "%" : "%"}
    </span>
  );
}

function PortfolioSignalTable({
  locations,
}: {
  locations: {
    id: string;
    name: string;
    forecast: {
      demandBand: string;
      weeklyDeltaPct: number;
      modifiers: { event: number; weekday: number; season: number; weather: number };
    };
  }[];
}) {
  const rows = [...locations].sort(
    (a, b) => a.forecast.weeklyDeltaPct - b.forecast.weeklyDeltaPct,
  );
  return (
    <Card className="divide-border divide-y p-0">
      {rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[1fr_auto] gap-3 p-4">
          <div>
            <p className="font-semibold">{row.name}</p>
            <p className="text-muted-foreground text-xs capitalize">
              {row.forecast.demandBand} · weekday{" "}
              {row.forecast.modifiers.weekday > 0 ? "+" : ""}
              {row.forecast.modifiers.weekday}% · event{" "}
              {row.forecast.modifiers.event > 0 ? "+" : ""}
              {row.forecast.modifiers.event}%
            </p>
          </div>
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              row.forecast.weeklyDeltaPct >= 0 ? "text-success" : "text-danger",
            )}
          >
            {row.forecast.weeklyDeltaPct > 0 ? "+" : ""}
            {row.forecast.weeklyDeltaPct}%
          </span>
        </div>
      ))}
    </Card>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        status === "ok" && "bg-success",
        status === "degraded" && "bg-warning",
        status === "missing_credentials" && "bg-muted-foreground",
        status === "unavailable" && "bg-danger",
      )}
    />
  );
}
