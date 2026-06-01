"use client";

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
  SectionTitle,
  WeatherStrip,
  WeekBars,
  eur,
} from "@/components/business/business-widgets";
import {
  useActiveLocation,
  useBusinessHasHydrated,
  useBusinessStore,
} from "@/lib/store/business";
import { useGroupForecast, useLocationForecast } from "@/lib/business/use-forecast";
import { buildBriefing } from "@/lib/business/forecast";

export default function BusinessHomePage() {
  const hydrated = useBusinessHasHydrated();
  const locations = useBusinessStore((s) => s.locations);
  const setActive = useBusinessStore((s) => s.setActiveLocation);
  const group = useBusinessStore((s) => s.group);
  const active = useActiveLocation();

  const { forecast, weather, ctx } = useLocationForecast(active);
  const groupForecast = useGroupForecast(locations, ctx.seasonIndex);

  if (!hydrated) return null;
  if (!active || !forecast) return <OnboardPrompt />;

  const budgetGap = forecast.weeklyForecast - forecast.weeklyBudget;
  const kpis = [
    {
      label: "Forecast today",
      value: eur(forecast.revenue),
      sub: `${forecast.deltaVsNormalPct > 0 ? "+" : ""}${forecast.deltaVsNormalPct}% vs normal`,
      tone:
        forecast.deltaVsNormalPct > 0
          ? ("good" as const)
          : forecast.deltaVsNormalPct < 0
            ? ("bad" as const)
            : undefined,
    },
    { label: "Covers", value: `${forecast.covers}` },
    { label: "Avg ticket", value: eur(forecast.avgTicket) },
    { label: "Productivity", value: `${eur(forecast.productivity)}/h` },
    {
      label: "Labour ratio",
      value: `${(forecast.laborRatio * 100).toFixed(1)}%`,
      sub: `${forecast.laborHours}h planned`,
    },
    {
      label: "Budget gap (wk)",
      value: eur(budgetGap),
      sub: `${forecast.budgetProgressPct}% achieved`,
      tone: budgetGap >= 0 ? ("good" as const) : ("bad" as const),
    },
  ];

  return (
    <div>
      <AppHeader
        title={group.name || "Command"}
        subtitle={`${active.city} · ${active.country} · ${active.seats + active.terraceSeats} seats`}
        action={
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        }
        homeHref="/business/home"
      />

      <div className="space-y-7 px-5 pt-2">
        {locations.length > 1 && (
          <ChipBar
            ariaLabel="Location"
            value={active.id}
            onChange={setActive}
            options={locations.map((l) => ({ value: l.id, label: l.name }))}
          />
        )}

        <ForecastHero
          title={active.name}
          subtitle="Today · operating forecast"
          forecast={forecast}
          briefing={buildBriefing(active, forecast)}
        />

        <section>
          <SectionTitle title="Restaurant KPIs" />
          <KpiGrid items={kpis} />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <div>
            <SectionTitle title="Today's weather" />
            <WeatherStrip weather={weather.data?.today ?? null} />
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
                  value={`${forecast.modifiers.season > 0 ? "+" : ""}${forecast.modifiers.season}%`}
                />
              </div>
              <p className="text-muted-foreground/70 mt-3 text-[11px]">
                Source: Eurostat · {active.country}
              </p>
            </Card>
          </div>
        </section>

        <section>
          <SectionTitle title="Daypart demand" href="/business/forecast" />
          <DaypartBars dayparts={forecast.dayparts} />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <div>
            <SectionTitle title="This week" href="/business/forecast" />
            <WeekBars week={forecast.week} />
          </div>
          <div>
            <SectionTitle title="Budget" />
            <BudgetProgress
              achieved={forecast.weeklyAchieved}
              budget={forecast.weeklyBudget}
              forecast={forecast.weeklyForecast}
            />
          </div>
        </section>

        {locations.length > 1 && (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="bg-muted flex size-11 items-center justify-center rounded-xl">
                <Icon name="Store" className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {group.name || "Group"} · {locations.length} locations
                </p>
                <p className="text-muted-foreground text-sm">
                  Forecast today {eur(groupForecast.revenue)} ·{" "}
                  {groupForecast.covers} covers
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href="/business/locations">Open</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
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
