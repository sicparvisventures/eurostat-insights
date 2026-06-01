"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipBar } from "@/components/ui/chip-bar";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { Icon } from "@/components/ui/icon";
import {
  BudgetProgress,
  DaypartBars,
  HourlyCurve,
  SectionTitle,
  ShiftLaborBars,
  WeekBars,
  eur,
} from "@/components/business/business-widgets";
import {
  dateFromInput,
  ForecastDateControl,
  todayInputValue,
} from "@/components/business/forecast-date-control";
import {
  ForecastMonthView,
  type MonthForecastDay,
} from "@/components/business/forecast-calendar";
import {
  useBusinessHasHydrated,
  useBusinessStore,
  type LocationConfig,
} from "@/lib/store/business";
import { useBusinessContext } from "@/lib/business/context";
import { useGroupForecast, useLocationForecast } from "@/lib/business/use-forecast";
import {
  buildBriefing,
  computeForecast,
  simulatedEventUplift,
  type DayForecast,
  type ForecastModifiers,
} from "@/lib/business/forecast";
import { cn } from "@/lib/utils";

type WeatherScenario = "live" | "sunny" | "rainy";
type ForecastScope = "all" | string;
type ForecastView = "day" | "week" | "month";

const SUNNY = {
  tempMax: 28,
  tempMin: 18,
  precipitation: 0,
  windSpeed: 8,
  summary: "Sunny scenario",
};
const RAINY = {
  tempMax: 10,
  tempMin: 6,
  precipitation: 18,
  windSpeed: 34,
  summary: "Rainy scenario",
};

export default function BusinessForecastPage() {
  const hydrated = useBusinessHasHydrated();
  const group = useBusinessStore((s) => s.group);
  const locations = useBusinessStore((s) => s.locations);
  const activeId = useBusinessStore((s) => s.activeLocationId);
  const setActive = useBusinessStore((s) => s.setActiveLocation);

  const [scope, setScope] = useState<ForecastScope>("all");
  const [view, setView] = useState<ForecastView>("week");
  const [scenario, setScenario] = useState<WeatherScenario>("live");
  const [eventBoost, setEventBoost] = useState(0);
  const [forecastDate, setForecastDate] = useState(() => todayInputValue());
  const focusDate = dateFromInput(forecastDate);

  const selectedLocation =
    scope === "all"
      ? null
      : (locations.find((l) => l.id === scope) ??
        locations.find((l) => l.id === activeId) ??
        locations[0] ??
        null);
  const ctx = useBusinessContext(selectedLocation?.country ?? group.country);

  const override: Partial<ForecastModifiers> = {
    date: focusDate,
    applyToWeek: true,
  };
  if (scenario === "sunny") override.weather = SUNNY;
  if (scenario === "rainy") override.weather = RAINY;
  if (eventBoost > 0) override.eventUplift = eventBoost / 100;

  const { forecast } = useLocationForecast(selectedLocation, override);
  const groupForecast = useGroupForecast(
    locations,
    ctx.seasonIndex,
    focusDate,
    override,
  );
  const week = useMemo(
    () =>
      scope === "all"
        ? aggregateWeek(groupForecast.byLocation.map((row) => row.forecast.week))
        : (forecast?.week ?? []),
    [forecast?.week, groupForecast.byLocation, scope],
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    (focusDate.getDay() + 6) % 7,
  );
  function changeForecastDate(value: string) {
    const date = dateFromInput(value);
    setForecastDate(value);
    setSelectedDayIndex((date.getDay() + 6) % 7);
  }
  const selectedDay = week.find((day) => day.index === selectedDayIndex) ?? week[0];
  const monthDays = useMemo(
    () =>
      buildMonthDays({
        locations: scope === "all" ? locations : selectedLocation ? [selectedLocation] : [],
        anchor: focusDate,
        seasonIndex: ctx.seasonIndex,
        eventBoost,
        scenario,
      }),
    [ctx.seasonIndex, eventBoost, focusDate, locations, scenario, scope, selectedLocation],
  );

  if (!hydrated) return null;
  if (!locations.length) return <EmptyForecast />;

  const locationOptions = [
    { value: "all", label: "All locations" },
    ...locations.map((l) => ({ value: l.id, label: l.name })),
  ];
  const weeklyTarget =
    scope === "all" ? groupForecast.weeklyTarget : (forecast?.weeklyTarget ?? 0);
  const weeklyForecast =
    scope === "all" ? groupForecast.weeklyForecast : (forecast?.weeklyForecast ?? 0);
  const weeklyDelta = weeklyTarget
    ? Math.round((weeklyForecast / weeklyTarget - 1) * 100)
    : 0;

  return (
    <div>
      <AppHeader
        title="Forecast"
        subtitle={
          scope === "all"
            ? `${locations.length} locations · portfolio forecast`
            : selectedLocation
              ? `${selectedLocation.name} · ${selectedLocation.city}`
              : "Portfolio forecast"
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
        <ForecastDateControl value={forecastDate} onChange={changeForecastDate} />

        <ScenarioPlanner
          scenario={scenario}
          setScenario={setScenario}
          eventBoost={eventBoost}
          setEventBoost={setEventBoost}
        />

        {scope === "all" ? (
          <PortfolioForecastHero
            groupName={group.name || "All locations"}
            revenue={groupForecast.weeklyForecast}
            covers={weeklyCovers(groupForecast.byLocation)}
            weeklyDelta={weeklyDelta}
            locationCount={locations.length}
          />
        ) : selectedLocation && forecast ? (
          <WeekOperatingHero
            title={selectedLocation.name}
            forecast={forecast}
            briefing={buildBriefing(selectedLocation, forecast)}
          />
        ) : null}

        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
        />

        {view === "day" && scope !== "all" && forecast && selectedLocation && (
          <>
            <section>
              <SectionTitle title="Daypart plan" />
              <DaypartBars dayparts={forecast.dayparts} />
            </section>
            <section>
              <SectionTitle title="Hourly revenue curve" />
              <HourlyCurve hourly={forecast.hourly} />
            </section>
            <section>
              <SectionTitle title="Shift volume vs labour" />
              <ShiftLaborBars forecast={forecast} />
              <p className="text-muted-foreground mt-2 px-1 text-xs">
                Staffing benchmark: {selectedLocation.targetStaffHoursPer1000}h per
                €1,000 · {forecast.laborHours}h planned for the focus day.
              </p>
            </section>
          </>
        )}

        {view === "day" && scope === "all" && (
          <PortfolioLocationTable locations={groupForecast.byLocation} />
        )}

        {view === "week" && (
          <section className="grid gap-3 lg:grid-cols-2">
            <div>
              <SectionTitle title="Forecast week" />
              <WeekBars
                week={week}
                selectedIndex={selectedDayIndex}
                onSelectDay={(day) => setSelectedDayIndex(day.index)}
              />
            </div>
            <div>
              <SectionTitle title="Day detail" />
              <DayDetail day={selectedDay} />
            </div>
            <div className="lg:col-span-2">
              <SectionTitle title="Forecast baseline" />
              <BudgetProgress
                target={weeklyTarget}
                forecast={weeklyForecast}
                deltaPct={weeklyDelta}
              />
            </div>
          </section>
        )}

        {view === "month" && (
          <ForecastMonthView
            anchor={focusDate}
            days={monthDays}
            selectedDate={forecastDate}
            onSelectDate={changeForecastDate}
          />
        )}
      </div>
    </div>
  );
}

function ScenarioPlanner({
  scenario,
  setScenario,
  eventBoost,
  setEventBoost,
}: {
  scenario: WeatherScenario;
  setScenario: (scenario: WeatherScenario) => void;
  eventBoost: number;
  setEventBoost: (value: number) => void;
}) {
  return (
    <section>
      <SectionTitle title="Scenario planner" />
      <Card className="space-y-5 p-5">
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { value: "live" as const, label: "Live", icon: "CloudSun" },
            { value: "sunny" as const, label: "Sunny", icon: "Sun" },
            { value: "rainy" as const, label: "Rainy", icon: "CloudRain" },
          ].map((option) => {
            const active = scenario === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setScenario(option.value)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted",
                )}
              >
                <Icon name={option.icon} className="size-5" />
                <div>
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p
                    className={cn(
                      "text-xs",
                      active
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground",
                    )}
                  >
                    {option.value === "live"
                      ? "Open-Meteo forecast"
                      : option.value === "sunny"
                        ? "Terrace upside"
                        : "Walk-in drag"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <Slider
          label="Event uplift"
          value={eventBoost}
          min={0}
          max={25}
          format={(v) => `+${v}%`}
          hint="Use this for concerts, sport, markets or local festivals until event APIs are connected."
          onChange={setEventBoost}
        />
      </Card>
    </section>
  );
}

function PortfolioForecastHero({
  groupName,
  revenue,
  covers,
  weeklyDelta,
  locationCount,
}: {
  groupName: string;
  revenue: number;
  covers: number;
  weeklyDelta: number;
  locationCount: number;
}) {
  return (
    <Card className="p-5">
      <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
        Week · portfolio forecast
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <h1 className="text-4xl font-bold tracking-tight tabular-nums">
          {eur(revenue)}
        </h1>
        <span
          className={cn(
            "mb-1.5 text-xs font-semibold",
            weeklyDelta >= 0 ? "text-success" : "text-danger",
          )}
        >
          {weeklyDelta > 0 ? "+" : ""}
          {weeklyDelta}% week vs baseline
        </span>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        {groupName} · {locationCount} locations · {covers} covers
      </p>
    </Card>
  );
}

function WeekOperatingHero({
  title,
  forecast,
  briefing,
}: {
  title: string;
  forecast: NonNullable<ReturnType<typeof computeForecast>>;
  briefing: string;
}) {
  const gap = forecast.weeklyForecast - forecast.weeklyTarget;
  return (
    <Card className="p-5">
      <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
        Week · operating forecast
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <h1 className="text-4xl font-bold tracking-tight tabular-nums">
          {eur(forecast.weeklyForecast)}
        </h1>
        <span
          className={cn(
            "mb-1.5 text-xs font-semibold",
            forecast.weeklyDeltaPct >= 0 ? "text-success" : "text-danger",
          )}
        >
          {forecast.weeklyDeltaPct > 0 ? "+" : ""}
          {forecast.weeklyDeltaPct}% week vs baseline
        </span>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        {title} · {weekCovers(forecast)} covers · gap {eur(gap)}
      </p>
      <p className="text-foreground/90 mt-4 text-sm leading-relaxed">
        {briefing}
      </p>
    </Card>
  );
}

function PortfolioLocationTable({
  locations,
}: {
  locations: { id: string; name: string; forecast: { revenue: number; covers: number; deltaVsNormalPct: number } }[];
}) {
  const rows = [...locations].sort((a, b) => b.forecast.revenue - a.forecast.revenue);
  return (
    <section>
      <SectionTitle title="Location detail" />
      <Card className="divide-border divide-y p-0">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{row.name}</p>
              <p className="text-muted-foreground text-xs">
                {row.forecast.covers} covers
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold tabular-nums">{eur(row.forecast.revenue)}</p>
              <p
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  row.forecast.deltaVsNormalPct >= 0
                    ? "text-success"
                    : "text-danger",
                )}
              >
                {row.forecast.deltaVsNormalPct > 0 ? "+" : ""}
                {row.forecast.deltaVsNormalPct}%
              </p>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}

function DayDetail({ day }: { day?: DayForecast }) {
  if (!day) {
    return (
      <Card className="p-5">
        <p className="text-muted-foreground text-sm">Select a day.</p>
      </Card>
    );
  }
  const delta = day.baseline ? Math.round((day.revenue / day.baseline - 1) * 100) : 0;
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            {day.isFocus ? "Focus day" : "Week day"}
          </p>
          <h3 className="mt-1 text-xl font-bold">{day.weekday}</h3>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            delta >= 0 ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta}%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <Mini label="Forecast" value={eur(day.revenue)} />
        <Mini label="Baseline" value={eur(day.baseline)} />
        <Mini label="Covers" value={`${day.covers}`} />
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-3">
      <p className="text-muted-foreground text-[10px] uppercase">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function aggregateWeek(weeks: DayForecast[][]): DayForecast[] {
  if (!weeks.length) return [];
  return weeks[0].map((day, index) => {
    const rows = weeks.map((week) => week[index]);
    return {
      weekday: day.weekday,
      index,
      revenue: rows.reduce((sum, row) => sum + row.revenue, 0),
      baseline: rows.reduce((sum, row) => sum + row.baseline, 0),
      covers: rows.reduce((sum, row) => sum + row.covers, 0),
      isFocus: rows.some((row) => row.isFocus),
      open: rows.some((row) => row.open),
    };
  });
}

function weekCovers(forecast: ReturnType<typeof computeForecast>) {
  return forecast.week.reduce((sum, day) => sum + day.covers, 0);
}

function weeklyCovers(
  locations: { forecast: ReturnType<typeof computeForecast> }[],
) {
  return locations.reduce((sum, row) => sum + weekCovers(row.forecast), 0);
}

function buildMonthDays({
  locations,
  anchor,
  seasonIndex,
  eventBoost,
  scenario,
}: {
  locations: LocationConfig[];
  anchor: Date;
  seasonIndex: number;
  eventBoost: number;
  scenario: WeatherScenario;
}): MonthForecastDay[] {
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(anchor.getFullYear(), anchor.getMonth(), i + 1, 12);
    const rows = locations.map((location) =>
      computeForecast(location, {
        date,
        seasonIndex,
        eventUplift:
          eventBoost > 0
            ? eventBoost / 100
            : simulatedEventUplift(location, date),
        weather:
          scenario === "sunny" ? SUNNY : scenario === "rainy" ? RAINY : null,
      }),
    );
    return {
      date,
      revenue: rows.reduce((sum, row) => sum + row.revenue, 0),
      baseline: rows.reduce(
        (sum, row) =>
          sum + (row.week.find((day) => day.isFocus)?.baseline ?? row.revenue),
        0,
      ),
      covers: rows.reduce((sum, row) => sum + row.covers, 0),
    };
  });
}

function EmptyForecast() {
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
