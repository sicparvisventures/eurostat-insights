"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/shell/app-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Icon } from "@/components/ui/icon";
import {
  BusinessScoreCard,
  DaypartRows,
  HotspotList,
  SectionTitle,
  SourceHealthList,
} from "@/components/business/business-widgets";
import {
  DAYPART_FORECASTS,
  HOTSPOT_ESTIMATES,
  SOURCE_HEALTH,
} from "@/lib/business/signals";
import {
  DISTRICT_KPIS,
  LOCATION_KPIS,
} from "@/lib/business/restaurant-kpis";
import { useBusinessStore } from "@/lib/store/business";
import { DEFAULT_DATA_RANGE, type DataRange } from "@/lib/date-range";

export default function BusinessHomePage() {
  const profile = useBusinessStore((state) => state.profile);
  const [range, setRange] = useState<DataRange>(DEFAULT_DATA_RANGE);
  const dinner = DAYPART_FORECASTS.find((item) => item.id === "dinner");
  const sourceIssues = SOURCE_HEALTH.filter(
    (item) => item.status !== "ok",
  ).length;

  return (
    <div>
      <AppHeader
        title={profile.businessName || "Business Mode"}
        subtitle={`${profile.city}, ${profile.country} · ${profile.seats + profile.terraceSeats} seats`}
        action={<ThemeToggle />}
        homeHref="/business/home"
      />

      <div className="space-y-7 px-5 pt-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Planning window</p>
            <p className="text-muted-foreground text-xs">
              Used for KPI review and forecast context.
            </p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                Today · operating forecast
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Dinner is likely above normal.
              </h1>
            </div>
            <div className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-xl">
              <Icon name="Utensils" className="size-5" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Expected uplift is driven by event spillover, strong transit pressure
            and a dry evening window. Keep the floor covered and increase mains
            prep for the dinner daypart.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Kpi label="Demand" value={`${dinner?.demand ?? 78}`} />
            <Kpi
              label="Uplift"
              value={`+${dinner?.delta ?? 18}%`}
            />
            <Kpi
              label="Conf."
              value={`${dinner?.confidence ?? 82}%`}
            />
          </div>
        </section>

        <section>
          <SectionTitle icon="Euro" title="Restaurant KPIs" />
          <div className="grid grid-cols-2 gap-3">
            {[...LOCATION_KPIS.slice(0, 4), ...DISTRICT_KPIS.slice(0, 2)].map(
              (kpi) => (
                <Card key={kpi.id} className="p-4">
                  <p className="text-muted-foreground text-xs font-medium">
                    {kpi.label}
                  </p>
                  <p className="mt-3 text-xl font-bold tracking-tight">
                    {kpi.value}
                  </p>
                  {kpi.delta && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {kpi.delta}
                    </p>
                  )}
                </Card>
              ),
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <BusinessScoreCard
            label="Weather effect"
            value="72"
            detail="Terrace comfort score"
            icon="CloudSun"
          />
          <BusinessScoreCard
            label="Source gaps"
            value={`${sourceIssues}`}
            detail="Connectors need attention"
            icon="Database"
          />
        </section>

        <section>
          <SectionTitle
            icon="LineChart"
            title="Daypart demand"
            href="/business/forecast"
          />
          <DaypartRows forecasts={DAYPART_FORECASTS.slice(1, 4)} active="dinner" />
        </section>

        <section>
          <SectionTitle
            icon="MapPinned"
            title="Tonight's hotspots near you"
            href="/business/forecast"
          />
          <HotspotList hotspots={HOTSPOT_ESTIMATES.slice(0, 2)} />
        </section>

        <section>
          <SectionTitle
            icon="Database"
            title="Source health"
            href="/business/signals"
          />
          <SourceHealthList items={SOURCE_HEALTH.slice(0, 5)} />
        </section>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted flex size-11 items-center justify-center rounded-xl">
              <Icon name="Store" className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Location portfolio</p>
              <p className="text-muted-foreground text-sm">
                Single-location mode now, chain comparison ready.
              </p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/business/locations">Open</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-xl p-3">
      <p className="text-muted-foreground text-[10px] uppercase">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
