"use client";

import { useState } from "react";
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
  ForecastHero,
  HourlyCurve,
  SectionTitle,
  ShiftLaborBars,
  WeekBars,
} from "@/components/business/business-widgets";
import {
  dateFromInput,
  ForecastDateControl,
  todayInputValue,
} from "@/components/business/forecast-date-control";
import {
  useActiveLocation,
  useBusinessHasHydrated,
  useBusinessStore,
} from "@/lib/store/business";
import { useLocationForecast } from "@/lib/business/use-forecast";
import { buildBriefing, type ForecastModifiers } from "@/lib/business/forecast";

type WeatherScenario = "live" | "sunny" | "rainy";

const SUNNY = { tempMax: 25, tempMin: 15, precipitation: 0, windSpeed: 10, summary: "Clear" };
const RAINY = { tempMax: 14, tempMin: 9, precipitation: 9, windSpeed: 26, summary: "Rain" };

export default function BusinessForecastPage() {
  const hydrated = useBusinessHasHydrated();
  const locations = useBusinessStore((s) => s.locations);
  const setActive = useBusinessStore((s) => s.setActiveLocation);
  const active = useActiveLocation();

  const [scenario, setScenario] = useState<WeatherScenario>("live");
  const [eventBoost, setEventBoost] = useState(0);
  const [forecastDate, setForecastDate] = useState(() => todayInputValue());
  const focusDate = dateFromInput(forecastDate);

  const override: Partial<ForecastModifiers> = { date: focusDate };
  if (scenario === "sunny") override.weather = SUNNY;
  if (scenario === "rainy") override.weather = RAINY;
  if (eventBoost > 0) override.eventUplift = eventBoost / 100;

  const { forecast } = useLocationForecast(active, override);

  if (!hydrated) return null;
  if (!active || !forecast) {
    return (
      <EmptyForecast />
    );
  }

  return (
    <div>
      <AppHeader
        title="Forecast"
        subtitle={`${active.name} · ${active.city}`}
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
        <ForecastDateControl
          value={forecastDate}
          onChange={setForecastDate}
        />

        {/* Scenario planner */}
        <section>
          <SectionTitle title="Scenario planner" />
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Weather</p>
                <p className="text-muted-foreground text-xs">
                  Live uses today&apos;s Open-Meteo data.
                </p>
              </div>
              <div className="no-scrollbar overflow-x-auto">
                <Segmented
                  value={scenario}
                  onChange={setScenario}
                  options={[
                    { value: "live", label: "Live" },
                    { value: "sunny", label: "Sunny" },
                    { value: "rainy", label: "Rainy" },
                  ]}
                />
              </div>
            </div>
            <Slider
              label="Event uplift"
              value={eventBoost}
              min={0}
              max={25}
              format={(v) => `+${v}%`}
              hint="Simulate nearby concerts, sports or festivals."
              onChange={setEventBoost}
            />
          </Card>
        </section>

        <ForecastHero
          title={active.name}
          subtitle="Scenario · operating forecast"
          forecast={forecast}
          briefing={buildBriefing(active, forecast)}
        />

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
            Staffing benchmark: {active.targetStaffHoursPer1000}h per €1,000 ·{" "}
            {forecast.laborHours}h planned today.
          </p>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <div>
            <SectionTitle title="This week" />
            <WeekBars week={forecast.week} />
          </div>
          <div>
            <SectionTitle title="Budget" />
            <BudgetProgress
              target={forecast.weeklyTarget}
              forecast={forecast.weeklyForecast}
              deltaPct={forecast.weeklyDeltaPct}
            />
          </div>
        </section>
      </div>
    </div>
  );
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
