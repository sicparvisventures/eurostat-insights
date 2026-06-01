"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  BusinessTypePicker,
  CitySelect,
  LocationSliders,
} from "@/components/business/location-form";
import {
  dateFromInput,
  ForecastDateControl,
  todayInputValue,
} from "@/components/business/forecast-date-control";
import { BelgiumLocationMap } from "@/components/business/belgium-location-map";
import {
  KpiGrid,
  SectionTitle,
  eur,
} from "@/components/business/business-widgets";
import {
  newLocation,
  useBusinessHasHydrated,
  useBusinessStore,
  type LocationConfig,
} from "@/lib/store/business";
import { citiesForCountry } from "@/lib/business/cities";
import { useBusinessContext } from "@/lib/business/context";
import { useGroupForecast } from "@/lib/business/use-forecast";
import { cn } from "@/lib/utils";

export default function BusinessLocationsPage() {
  const hydrated = useBusinessHasHydrated();
  const group = useBusinessStore((s) => s.group);
  const locations = useBusinessStore((s) => s.locations);
  const setActive = useBusinessStore((s) => s.setActiveLocation);
  const activeId = useBusinessStore((s) => s.activeLocationId);
  const addLocation = useBusinessStore((s) => s.addLocation);
  const removeLocation = useBusinessStore((s) => s.removeLocation);
  const duplicateLocation = useBusinessStore((s) => s.duplicateLocation);
  const ctx = useBusinessContext(group.country);
  const [forecastDate, setForecastDate] = useState(() => todayInputValue());
  const focusDate = dateFromInput(forecastDate);
  const groupForecast = useGroupForecast(locations, ctx.seasonIndex, focusDate);

  const [adding, setAdding] = useState(false);

  if (!hydrated) return null;

  const sorted = [...groupForecast.byLocation].sort(
    (a, b) => b.forecast.revenue - a.forecast.revenue,
  );
  const max = Math.max(...sorted.map((r) => r.forecast.revenue), 1);

  return (
    <div>
      <AppHeader
        title="Locations"
        subtitle={`${group.name || "Group"} · ${locations.length} sites`}
        homeHref="/business/home"
      />

      <div className="space-y-7 px-5 pt-2">
        <ForecastDateControl
          value={forecastDate}
          onChange={setForecastDate}
          compact
        />

        {locations.length > 0 && (
          <section>
            <SectionTitle title="Group today" />
            <KpiGrid
              items={[
                { label: "Forecast revenue", value: eur(groupForecast.revenue) },
                { label: "Covers", value: `${groupForecast.covers}` },
                {
                  label: "Labour ratio",
                  value: `${(groupForecast.laborRatio * 100).toFixed(1)}%`,
                },
                {
                  label: "Weekly baseline",
                  value: eur(groupForecast.weeklyTarget),
                },
                {
                  label: "Weekly forecast",
                  value: eur(groupForecast.weeklyForecast),
                },
                { label: "Avg ticket", value: eur(groupForecast.avgTicket) },
              ]}
            />
          </section>
        )}

        {sorted.length > 0 && (
          <section className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <SectionTitle title="Revenue by location · focus day" />
              <Card className="space-y-3 p-4">
                {sorted.map((row) => (
                  <button
                    key={row.id}
                    onClick={() => setActive(row.id)}
                    className="block w-full text-left"
                  >
                    <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                      <span
                        className={cn(
                          "font-semibold",
                          row.id === activeId && "text-primary",
                        )}
                      >
                        {row.name}
                      </span>
                      <span className="tabular-nums">
                        {eur(row.forecast.revenue)}{" "}
                        <span className="text-muted-foreground">
                          · {row.forecast.deltaVsNormalPct > 0 ? "+" : ""}
                          {row.forecast.deltaVsNormalPct}%
                        </span>
                      </span>
                    </div>
                    <div className="bg-muted h-2.5 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${Math.max((row.forecast.revenue / max) * 100, 3)}%`,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </Card>
            </div>
            <div>
              <SectionTitle title="Location map" />
              <BelgiumLocationMap
                locations={locations}
                forecasts={groupForecast.byLocation}
                activeId={activeId}
                onSelect={setActive}
              />
            </div>
          </section>
        )}

        <section>
          <SectionTitle title="Portfolio" />
          <div className="grid gap-3 lg:grid-cols-2">
            {groupForecast.byLocation.map((row) => {
              const loc = locations.find((l) => l.id === row.id)!;
              return (
                <Card key={row.id} className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{row.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {loc.city} · {loc.seats + loc.terraceSeats} seats ·{" "}
                        {loc.priceTier}
                      </p>
                    </div>
                    <div className="-mr-1 -mt-1 flex shrink-0 items-center">
                      <button
                        onClick={() => duplicateLocation(row.id)}
                        aria-label={`Copy ${row.name}`}
                        title="Copy config"
                        className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-full"
                      >
                        <Icon name="Layers" className="size-4" />
                      </button>
                      {locations.length > 1 && (
                        <button
                          onClick={() => removeLocation(row.id)}
                          aria-label={`Remove ${row.name}`}
                          className="text-muted-foreground hover:text-danger flex size-8 items-center justify-center rounded-full"
                        >
                          <Icon name="Trash2" className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Mini label="Today" value={eur(row.forecast.revenue)} />
                    <Mini label="Covers" value={`${row.forecast.covers}`} />
                    <Mini
                      label="Labour"
                      value={`${(row.forecast.laborRatio * 100).toFixed(0)}%`}
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setActive(row.id)}
                      asChild
                    >
                      <Link href="/business/forecast">Open forecast</Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Add location */}
        {adding ? (
          <AddLocation
            country={group.country}
            onCancel={() => setAdding(false)}
            onAdd={(loc) => {
              addLocation(loc);
              setAdding(false);
            }}
          />
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setAdding(true)}
          >
            <Icon name="Plus" /> Add location
          </Button>
        )}
      </div>
    </div>
  );
}

function AddLocation({
  country,
  onAdd,
  onCancel,
}: {
  country: string;
  onAdd: (loc: LocationConfig) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<LocationConfig>(() =>
    newLocation({ country, city: citiesForCountry(country)[0] }),
  );
  const update = (patch: Partial<LocationConfig>) =>
    setDraft((d) => ({ ...d, ...patch }));

  return (
    <Card className="space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">New location</h3>
        <button
          onClick={onCancel}
          aria-label="Cancel"
          className="hover:bg-muted flex size-8 items-center justify-center rounded-full"
        >
          <Icon name="X" className="size-4" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
            Name
          </span>
          <input
            value={draft.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="GK2"
            className="field-input"
          />
        </label>
        <label className="block">
          <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
            City
          </span>
          <CitySelect
            country={country}
            value={draft.city}
            onChange={(city) => update({ city })}
          />
        </label>
      </div>
      <BusinessTypePicker
        value={draft.businessType}
        onChange={(businessType) => update({ businessType })}
      />
      <LocationSliders value={draft} onChange={update} />
      <Button
        className="w-full"
        disabled={!draft.name.trim() || !draft.city.trim()}
        onClick={() => onAdd({ ...draft, country })}
      >
        <Icon name="Plus" /> Add to portfolio
      </Button>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-2">
      <p className="text-muted-foreground text-[10px] uppercase">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}
