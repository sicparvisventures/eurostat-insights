"use client";

import { useState } from "react";
import { AppHeader } from "@/components/shell/app-header";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Icon } from "@/components/ui/icon";
import {
  DaypartRows,
  HotspotList,
  SectionTitle,
} from "@/components/business/business-widgets";
import {
  DAYPART_FORECASTS,
  HOTSPOT_ESTIMATES,
  demandBand,
} from "@/lib/business/signals";
import {
  FORECAST_ENGINE_STEPS,
  KM11_HOURLY_REVENUE,
} from "@/lib/business/restaurant-kpis";
import { useBusinessStore } from "@/lib/store/business";
import { DEFAULT_DATA_RANGE, type DataRange } from "@/lib/date-range";

export default function BusinessForecastPage() {
  const profile = useBusinessStore((state) => state.profile);
  const [range, setRange] = useState<DataRange>(DEFAULT_DATA_RANGE);
  const dinner = DAYPART_FORECASTS.find((item) => item.id === "dinner");

  return (
    <div>
      <AppHeader
        title="Forecast"
        subtitle={`${profile.city} · today and this week`}
        homeHref="/business/home"
      />

      <div className="space-y-7 px-5 pt-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Forecast window</p>
            <p className="text-muted-foreground text-xs">
              Daily now; week/month aggregation is model-ready.
            </p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                Dinner · {dinner?.window}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {dinner?.demand}% demand score
              </h1>
            </div>
            <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              {dinner ? demandBand(dinner.demand) : "busy"}
            </span>
          </div>
          <div className="mb-5 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${dinner?.demand ?? 78}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Advice icon="Users" title="Staffing" value={dinner?.staff} />
            <Advice icon="Store" title="Stock" value={dinner?.stock} />
          </div>
        </section>

        <section>
          <SectionTitle icon="BarChart3" title="Hourly revenue baseline" />
          <Card className="p-4">
            <div className="space-y-2.5">
              {KM11_HOURLY_REVENUE.map((row) => (
                <div key={row.hour} className="grid grid-cols-[48px_1fr_74px] items-center gap-3 text-sm">
                  <span className="text-muted-foreground font-mono text-xs">
                    {row.hour}
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(row.share * 5, 4)}%` }}
                    />
                  </div>
                  <span className="text-right font-semibold tabular-nums">
                    EUR {row.revenue.toLocaleString("en-GB")}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle icon="Info" title="Forecast engine evidence" />
          <div className="space-y-3">
            {FORECAST_ENGINE_STEPS.map((step) => (
              <Card key={step.step} className="p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="font-semibold">{step.step}</p>
                  <span className="bg-muted rounded-full px-2 py-1 text-xs font-semibold">
                    {step.weight}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.detail}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon="Clock" title="Daypart plan" />
          <DaypartRows forecasts={DAYPART_FORECASTS} active="dinner" />
        </section>

        <section>
          <SectionTitle icon="MapPinned" title="Hotspot explanation" />
          <HotspotList hotspots={HOTSPOT_ESTIMATES} />
        </section>
      </div>
    </div>
  );
}

function Advice({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value?: string;
}) {
  return (
    <Card className="p-4">
      <Icon name={icon} className="text-muted-foreground mb-3 size-4" />
      <p className="text-muted-foreground text-xs">{title}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </Card>
  );
}
