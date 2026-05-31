"use client";

import { AppHeader } from "@/components/shell/app-header";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { SectionTitle } from "@/components/business/business-widgets";
import { useBusinessStore } from "@/lib/store/business";

export default function BusinessLocationsPage() {
  const profile = useBusinessStore((state) => state.profile);

  return (
    <div>
      <AppHeader
        title="Locations"
        subtitle="Portfolio and catchment setup"
        homeHref="/business/home"
      />

      <div className="space-y-7 px-5 pt-2">
        <section>
          <SectionTitle icon="Store" title="Primary location" />
          <Card className="p-5">
            <div className="mb-5 flex items-start gap-4">
              <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-xl">
                <Icon name="MapPinned" className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold tracking-tight">
                  {profile.businessName || "Business location"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {profile.address || "Address not set"} · {profile.city},{" "}
                  {profile.country}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  District: {profile.districtCode}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <LocationMetric label="Seats" value={`${profile.seats}`} />
              <LocationMetric
                label="Terrace"
                value={`${profile.terraceSeats}`}
              />
              <LocationMetric
                label="Ticket"
                value={`EUR ${profile.averageTicket}`}
              />
              <LocationMetric
                label="Budget"
                value={`EUR ${profile.dailyBudget.toLocaleString("en-GB")}`}
              />
              <LocationMetric
                label="Staff target"
                value={`${profile.targetStaffHoursPer1000}h`}
              />
              <LocationMetric
                label="Labor"
                value={`EUR ${profile.laborHourCost}/h`}
              />
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle icon="Map" title="Catchment rings" />
          <div className="grid grid-cols-1 gap-3">
            {[
              ["250m", "Immediate walk-in and competitor pressure"],
              ["500m", "Nearby events, hotels, cafes and bars"],
              ["1km", "City-center footfall and transit spillover"],
              ["3km", "Large venues, stations and district events"],
              ["10km", "Tourism and regional context"],
            ].map(([radius, detail]) => (
              <Card key={radius} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-muted flex size-12 items-center justify-center rounded-full font-mono text-sm font-semibold">
                    {radius}
                  </div>
                  <p className="text-muted-foreground text-sm">{detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon="Building2" title="Chain readiness" />
          <Card className="p-5">
            <p className="font-semibold">
              {profile.chainMode === "multi"
                ? "Multiple-location mode enabled"
                : "Single-location mode"}
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              The data model is ready for location portfolios, but this MVP keeps
              operational decisions focused on the primary site first.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}

function LocationMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-xl p-3">
      <p className="text-muted-foreground text-[10px] uppercase">{label}</p>
      <p className="mt-1 font-bold tabular-nums">{value}</p>
    </div>
  );
}
