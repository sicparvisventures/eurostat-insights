"use client";

import { AppHeader } from "@/components/shell/app-header";
import { Card } from "@/components/ui/card";
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
import { useBusinessStore } from "@/lib/store/business";

export default function BusinessForecastPage() {
  const profile = useBusinessStore((state) => state.profile);
  const dinner = DAYPART_FORECASTS.find((item) => item.id === "dinner");

  return (
    <div>
      <AppHeader
        title="Forecast"
        subtitle={`${profile.city} · today and this week`}
        homeHref="/business/home"
      />

      <div className="space-y-7 px-5 pt-2">
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
