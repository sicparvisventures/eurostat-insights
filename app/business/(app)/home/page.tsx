"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipBar } from "@/components/ui/chip-bar";
import { Icon } from "@/components/ui/icon";
import {
  BudgetProgress,
  DaypartBars,
  ForecastHero,
  KpiGrid,
  MiniStat,
  SectionTitle,
  WeatherStrip,
  WeekBars,
  eur,
} from "@/components/business/business-widgets";
import {
  useBusinessHasHydrated,
  useBusinessStore,
} from "@/lib/store/business";
import { useGroupForecast, useLocationForecast } from "@/lib/business/use-forecast";
import {
  dateFromInput,
  ForecastDateControl,
  todayInputValue,
} from "@/components/business/forecast-date-control";
import { buildBriefing } from "@/lib/business/forecast";
import { cn } from "@/lib/utils";

type HomeScope = "all" | string;

export default function BusinessHomePage() {
  const hydrated = useBusinessHasHydrated();
  const locations = useBusinessStore((s) => s.locations);
  const setActive = useBusinessStore((s) => s.setActiveLocation);
  const group = useBusinessStore((s) => s.group);
  const [scope, setScope] = useState<HomeScope>("all");
  const [forecastDate, setForecastDate] = useState(() => todayInputValue());
  const focusDate = dateFromInput(forecastDate);
  const active =
    scope === "all"
      ? null
      : (locations.find((location) => location.id === scope) ?? null);

  const { forecast, weather, ctx } = useLocationForecast(active, {
    date: focusDate,
  });
  const groupForecast = useGroupForecast(locations, ctx.seasonIndex, focusDate);

  if (!hydrated) return null;
  if (!locations.length) return <OnboardPrompt />;

  const isAll = scope === "all";
  const groupWeeklyGap = groupForecast.weeklyForecast - groupForecast.weeklyTarget;
  const groupWeeklyDeltaPct = groupForecast.weeklyTarget
    ? Math.round((groupForecast.weeklyForecast / groupForecast.weeklyTarget - 1) * 100)
    : 0;
  const selectedForecast = isAll ? null : forecast;
  const selectedLocation = isAll ? null : active;
  const activeCountry = selectedLocation?.country ?? group.country;
  const locationOptions = [
    { value: "all", label: "All locations" },
    ...locations.map((l) => ({ value: l.id, label: l.name })),
  ];

  const kpis = isAll
    ? [
        {
          label: "Forecast today",
          value: eur(groupForecast.revenue),
          sub: `${locations.length} locations · ${groupForecast.covers} covers`,
        },
        { label: "Covers", value: `${groupForecast.covers}` },
        { label: "Avg ticket", value: eur(groupForecast.avgTicket) },
        {
          label: "Labour ratio",
          value: `${(groupForecast.laborRatio * 100).toFixed(1)}%`,
        },
        {
          label: "Weekly baseline",
          value: eur(groupForecast.weeklyTarget),
        },
        {
          label: "Weekly lift",
          value: eur(groupWeeklyGap),
          sub: `${groupWeeklyDeltaPct > 0 ? "+" : ""}${groupWeeklyDeltaPct}% vs baseline`,
          tone: groupWeeklyGap >= 0 ? ("good" as const) : ("bad" as const),
        },
      ]
    : selectedForecast
      ? [
    {
      label: "Forecast today",
      value: eur(selectedForecast.revenue),
      sub: `${selectedForecast.deltaVsNormalPct > 0 ? "+" : ""}${selectedForecast.deltaVsNormalPct}% vs normal`,
      tone:
        selectedForecast.deltaVsNormalPct > 0
          ? ("good" as const)
          : selectedForecast.deltaVsNormalPct < 0
            ? ("bad" as const)
            : undefined,
    },
    { label: "Covers", value: `${selectedForecast.covers}` },
    { label: "Avg ticket", value: eur(selectedForecast.avgTicket) },
    { label: "Productivity", value: `${eur(selectedForecast.productivity)}/h` },
    {
      label: "Labour ratio",
      value: `${(selectedForecast.laborRatio * 100).toFixed(1)}%`,
      sub: `${selectedForecast.laborHours}h planned`,
    },
    {
      label: "Weekly lift",
      value: eur(selectedForecast.weeklyForecast - selectedForecast.weeklyTarget),
      sub: `${selectedForecast.weeklyDeltaPct > 0 ? "+" : ""}${selectedForecast.weeklyDeltaPct}% vs baseline`,
      tone:
        selectedForecast.weeklyForecast >= selectedForecast.weeklyTarget
          ? ("good" as const)
          : ("bad" as const),
    },
  ]
      : [];

  return (
    <div>
      <AppHeader
        title={group.name || "Command"}
        subtitle={
          isAll
            ? `${locations.length} locations · ${group.country}`
            : selectedLocation
              ? `${selectedLocation.city} · ${selectedLocation.country} · ${selectedLocation.seats + selectedLocation.terraceSeats} seats`
              : group.country
        }
        action={
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        }
        homeHref="/business/home"
      />

      <div className="space-y-7 px-5 pt-2">
        <ChipBar
          ariaLabel="Forecast scope"
          value={scope}
          onChange={(value) => {
            setScope(value);
            if (value !== "all") setActive(value);
          }}
          options={locationOptions}
        />
        <ForecastDateControl
          value={forecastDate}
          onChange={setForecastDate}
          compact
        />

        {isAll ? (
          <GroupForecastHero
            groupName={group.name || "All locations"}
            country={group.country}
            locationCount={locations.length}
            revenue={groupForecast.revenue}
            covers={groupForecast.covers}
            avgTicket={groupForecast.avgTicket}
            weeklyDeltaPct={groupWeeklyDeltaPct}
            briefing={districtBriefing(group.name, groupForecast.byLocation)}
          />
        ) : selectedLocation && selectedForecast ? (
          <ForecastHero
            title={selectedLocation.name}
            subtitle="Today · operating forecast"
            forecast={selectedForecast}
            briefing={buildBriefing(selectedLocation, selectedForecast)}
          />
        ) : null}

        <section>
          <SectionTitle title="Restaurant KPIs" />
          <KpiGrid items={kpis} />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <div>
            <SectionTitle title="Today's weather" />
            {isAll ? (
              <DistrictAttention locations={groupForecast.byLocation} />
            ) : (
              <WeatherStrip weather={weather.data?.today ?? null} />
            )}
          </div>
          <div>
            <SectionTitle title="Market context" />
            <Card className="p-4">
              <div className="space-y-3 text-sm">
                <Row label="Tourism season" value={ctx.seasonLabel} />
                <Row
                  label="Dining inflation"
                  value={
                    ctx.cateringInflation != null
                      ? `${ctx.cateringInflation.toFixed(1)}% y/y`
                      : "—"
                  }
                />
                <Row
                  label="Season effect"
                  value={
                    selectedForecast
                      ? `${selectedForecast.modifiers.season > 0 ? "+" : ""}${selectedForecast.modifiers.season}%`
                      : `${Math.round((ctx.seasonIndex - 1) * 100) > 0 ? "+" : ""}${Math.round((ctx.seasonIndex - 1) * 100)}%`
                  }
                />
              </div>
              <p className="text-muted-foreground/70 mt-3 text-[11px]">
                Source: Eurostat · {activeCountry}
              </p>
            </Card>
          </div>
        </section>

        {!isAll && selectedForecast && (
          <section>
            <SectionTitle title="Daypart demand" href="/business/forecast" />
            <DaypartBars dayparts={selectedForecast.dayparts} />
          </section>
        )}

        <section className="grid gap-3 lg:grid-cols-2">
          <div>
            <SectionTitle title="This week" href="/business/forecast" />
            {isAll ? (
              <RevenueByLocation locations={groupForecast.byLocation} />
            ) : selectedForecast ? (
              <WeekBars week={selectedForecast.week} />
            ) : null}
          </div>
          <div>
            <SectionTitle title="Forecast baseline" />
            <BudgetProgress
              target={
                isAll ? groupForecast.weeklyTarget : (selectedForecast?.weeklyTarget ?? 0)
              }
              forecast={
                isAll
                  ? groupForecast.weeklyForecast
                  : (selectedForecast?.weeklyForecast ?? 0)
              }
              deltaPct={
                isAll ? groupWeeklyDeltaPct : (selectedForecast?.weeklyDeltaPct ?? 0)
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function GroupForecastHero({
  groupName,
  country,
  locationCount,
  revenue,
  covers,
  avgTicket,
  weeklyDeltaPct,
  briefing,
}: {
  groupName: string;
  country: string;
  locationCount: number;
  revenue: number;
  covers: number;
  avgTicket: number;
  weeklyDeltaPct: number;
  briefing: string;
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
            Today · district forecast
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <h1 className="text-4xl font-bold tracking-tight tabular-nums">
              {eur(revenue)}
            </h1>
            <span
              className={cn(
                "mb-1.5 text-xs font-semibold tabular-nums",
                weeklyDeltaPct >= 0 ? "text-success" : "text-danger",
              )}
            >
              {weeklyDeltaPct > 0 ? "+" : ""}
              {weeklyDeltaPct}% week vs baseline
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {groupName} · {locationCount} locations · {country}
          </p>
        </div>
        <div className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-xl">
          <Icon name="Store" className="size-5" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <MiniStat label="Covers" value={`${covers}`} />
        <MiniStat label="Avg ticket" value={eur(avgTicket)} />
        <MiniStat label="Mode" value="All sites" />
      </div>
      <p className="text-foreground/90 mt-4 text-sm leading-relaxed">
        {briefing}
      </p>
    </section>
  );
}

function districtBriefing(
  groupName: string,
  locations: { name: string; forecast: { revenue: number; deltaVsNormalPct: number; demandBand: string } }[],
) {
  const sorted = [...locations].sort(
    (a, b) => a.forecast.deltaVsNormalPct - b.forecast.deltaVsNormalPct,
  );
  const soft = sorted.filter((row) => row.forecast.deltaVsNormalPct < 0).slice(0, 3);
  const hot = [...locations]
    .sort((a, b) => b.forecast.deltaVsNormalPct - a.forecast.deltaVsNormalPct)
    .slice(0, 2);
  const name = groupName || "The district";
  if (soft.length) {
    return `${name} is forecast as a portfolio first. Put management attention on ${soft.map((row) => row.name).join(", ")}; these sites sit below setup baseline while ${hot.map((row) => row.name).join(", ")} carry the strongest external-demand lift.`;
  }
  return `${name} is forecast as a portfolio first. No site is leaking versus setup baseline; use the strongest locations (${hot.map((row) => row.name).join(", ")}) to protect staffing and stock before the peak daypart.`;
}

function DistrictAttention({
  locations,
}: {
  locations: { id: string; name: string; forecast: { revenue: number; deltaVsNormalPct: number; demandBand: string } }[];
}) {
  const rows = [...locations]
    .sort((a, b) => a.forecast.deltaVsNormalPct - b.forecast.deltaVsNormalPct)
    .slice(0, 4);

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {rows.map((row) => {
          const leaking = row.forecast.deltaVsNormalPct < 0;
          return (
            <div key={row.id} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  leaking ? "bg-danger/10 text-danger" : "bg-success/10 text-success",
                )}
              >
                <Icon
                  name={leaking ? "ArrowDownRight" : "ArrowUpRight"}
                  className="size-4"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{row.name}</p>
                <p className="text-muted-foreground text-xs capitalize">
                  {row.forecast.demandBand} demand
                </p>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  leaking ? "text-danger" : "text-success",
                )}
              >
                {row.forecast.deltaVsNormalPct > 0 ? "+" : ""}
                {row.forecast.deltaVsNormalPct}%
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-muted-foreground mt-3 text-xs">
        Sorted by weakest external-demand lift first.
      </p>
    </Card>
  );
}

function RevenueByLocation({
  locations,
}: {
  locations: { id: string; name: string; forecast: { revenue: number; covers: number; deltaVsNormalPct: number } }[];
}) {
  const rows = [...locations].sort((a, b) => b.forecast.revenue - a.forecast.revenue);
  const max = Math.max(...rows.map((row) => row.forecast.revenue), 1);

  return (
    <Card className="space-y-3 p-4">
      {rows.map((row) => (
        <div key={row.id}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold">{row.name}</span>
            <span className="tabular-nums">
              {eur(row.forecast.revenue)}{" "}
              <span className="text-muted-foreground">
                · {row.forecast.covers} covers
              </span>
            </span>
          </div>
          <div className="bg-muted h-3 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{
                width: `${Math.max((row.forecast.revenue / max) * 100, 4)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function OnboardPrompt() {
  return (
    <div className="px-5 pt-16">
      <div className="mx-auto max-w-md text-center">
        <div className="bg-muted mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl">
          <Icon name="Utensils" className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Set up your restaurant
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Configure a location in under a minute to generate a live operating
          forecast from your own numbers.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/business/onboarding">
            Start setup <Icon name="ArrowRight" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
