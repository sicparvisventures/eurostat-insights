"use client";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cityCoordinates } from "@/lib/business/cities";
import type { LocationConfig } from "@/lib/store/business";
import { cn } from "@/lib/utils";

const BELGIUM_BOUNDS = {
  minLon: 2.48,
  maxLon: 6.42,
  minLat: 49.47,
  maxLat: 51.53,
};

function project(lat: number, lon: number) {
  const x =
    ((lon - BELGIUM_BOUNDS.minLon) /
      (BELGIUM_BOUNDS.maxLon - BELGIUM_BOUNDS.minLon)) *
    100;
  const y =
    (1 -
      (lat - BELGIUM_BOUNDS.minLat) /
        (BELGIUM_BOUNDS.maxLat - BELGIUM_BOUNDS.minLat)) *
    100;
  return { x, y };
}

export function BelgiumLocationMap({
  locations,
  forecasts,
  activeId,
  onSelect,
}: {
  locations: LocationConfig[];
  forecasts: {
    id: string;
    forecast: { revenue: number; deltaVsNormalPct: number };
  }[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const points = forecasts
    .map((row) => {
      const loc = locations.find((l) => l.id === row.id);
      if (!loc) return null;
      const coords = cityCoordinates(loc.country, loc.city);
      if (!coords) return null;
      const projected = project(coords.lat, coords.lon);
      return { ...row, loc, ...projected };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null);
  const max = Math.max(...points.map((p) => p.forecast.revenue), 1);

  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-semibold">Belgium portfolio map</p>
          <p className="text-muted-foreground text-xs">
            Location pressure by city and forecast lift.
          </p>
        </div>
        <Icon name="MapPinned" className="text-muted-foreground size-5" />
      </div>
      <div className="relative h-72 overflow-hidden rounded-xl border border-border bg-muted/35">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
          <path
            d="M18 30 L30 16 L48 14 L65 23 L78 20 L88 35 L80 52 L85 68 L69 83 L47 86 L33 77 L17 80 L9 62 L15 47 Z"
            fill="color-mix(in oklch, var(--color-primary) 9%, transparent)"
            stroke="color-mix(in oklch, var(--color-border) 75%, transparent)"
            strokeWidth="1"
          />
          <path
            d="M22 55 C36 47 49 48 62 38 C70 32 78 33 84 38"
            fill="none"
            stroke="color-mix(in oklch, var(--color-muted-foreground) 25%, transparent)"
            strokeDasharray="2 2"
            strokeWidth="0.8"
          />
        </svg>

        {points.map((point) => {
          const active = point.loc.id === activeId;
          const size = 13 + (point.forecast.revenue / max) * 14;
          const good = point.forecast.deltaVsNormalPct >= 0;
          return (
            <button
              key={point.loc.id}
              type="button"
              onClick={() => onSelect?.(point.loc.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              aria-label={`Select ${point.loc.name}`}
              title={`${point.loc.name} · ${point.loc.city}`}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full border-2 border-background text-[10px] font-bold shadow-sm",
                  active && "ring-primary ring-2 ring-offset-2 ring-offset-background",
                  good ? "bg-success text-white" : "bg-danger text-white",
                )}
                style={{ width: size, height: size }}
              >
                {point.forecast.deltaVsNormalPct > 0 ? "+" : ""}
              </span>
              <span className="bg-background/90 mt-1 block max-w-24 truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold shadow-sm">
                {point.loc.name}
              </span>
            </button>
          );
        })}

        {!points.length && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Add Belgian city locations to plot them on the map.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
