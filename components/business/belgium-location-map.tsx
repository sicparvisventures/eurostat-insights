"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { cityCoordinates } from "@/lib/business/cities";
import type { LocationConfig } from "@/lib/store/business";
import { cn } from "@/lib/utils";

interface GeoProps {
  id: string;
  name: string;
  eu: boolean;
}

const W = 360;
const H = 300;

function useBelgiumGeo() {
  return useQuery({
    queryKey: ["belgium-geo"],
    queryFn: async () => {
      const res = await fetch("/geo/europe.geojson");
      return (await res.json()) as FeatureCollection<Geometry, GeoProps>;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

function compactEuro(value: number) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);
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
    forecast: {
      revenue: number;
      deltaVsNormalPct: number;
      weeklyForecast?: number;
      weeklyDeltaPct?: number;
    };
  }[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const { data: geo, isLoading } = useBelgiumGeo();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { belgiumPath, borderPaths, points } = useMemo(() => {
    const empty = { belgiumPath: "", borderPaths: [] as string[], points: [] };
    if (!geo) return empty;

    const belgium = geo.features.find(
      (feature) => feature.properties.id === "BE",
    ) as Feature<Geometry, GeoProps> | undefined;
    if (!belgium) return empty;

    const projection = geoMercator().fitExtent(
      [
        [18, 18],
        [W - 18, H - 18],
      ],
      belgium,
    );
    const path = geoPath(projection);
    const neighbors = new Set(["FR", "NL", "DE", "LU"]);
    const borderPaths = geo.features
      .filter((feature) => neighbors.has(feature.properties.id))
      .map((feature) => path(feature) ?? "")
      .filter(Boolean);

    const points = forecasts
      .map((row) => {
        const loc = locations.find((location) => location.id === row.id);
        if (!loc) return null;
        const coords = cityCoordinates(loc.country, loc.city);
        if (!coords) return null;
        const projected = projection([coords.lon, coords.lat]);
        if (!projected) return null;
        const weeklyForecast = row.forecast.weeklyForecast ?? row.forecast.revenue;
        const weeklyDeltaPct =
          row.forecast.weeklyDeltaPct ?? row.forecast.deltaVsNormalPct;
        return {
          ...row,
          loc,
          x: projected[0],
          y: projected[1],
          weeklyForecast,
          weeklyDeltaPct,
        };
      })
      .filter((point): point is NonNullable<typeof point> => point !== null);

    return {
      belgiumPath: path(belgium) ?? "",
      borderPaths,
      points,
    };
  }, [forecasts, geo, locations]);

  const max = Math.max(...points.map((p) => p.weeklyForecast), 1);
  const hovered = points.find((point) => point.loc.id === hoveredId);

  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-semibold">Belgium portfolio map</p>
          <p className="text-muted-foreground text-xs">
            Real city placement with weekly forecast lift.
          </p>
        </div>
        <Icon name="MapPinned" className="text-muted-foreground size-5" />
      </div>
      <div className="relative h-72 overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_25%_20%,color-mix(in_oklch,var(--color-primary)_9%,transparent),transparent_38%),var(--color-muted)]/35">
        {isLoading ? (
          <Skeleton className="absolute inset-4 rounded-lg" />
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 size-full"
            role="img"
            aria-label="Map of Belgium with portfolio locations"
          >
            {borderPaths.map((d, index) => (
              <path
                key={index}
                d={d}
                fill="var(--color-muted)"
                fillOpacity="0.34"
                stroke="var(--color-background)"
                strokeWidth="1"
              />
            ))}
            <path
              d={belgiumPath}
              fill="var(--color-card)"
              stroke="color-mix(in oklch, var(--color-foreground) 32%, transparent)"
              strokeWidth="1.4"
            />
            <path
              d={belgiumPath}
              fill="var(--color-primary)"
              fillOpacity="0.1"
              stroke="var(--color-primary)"
              strokeOpacity="0.28"
              strokeWidth="0.7"
            />
          </svg>
        )}

        {points.map((point) => {
          const active = point.loc.id === activeId;
          const size = 14 + (point.weeklyForecast / max) * 16;
          const good = point.weeklyDeltaPct >= 0;
          return (
            <button
              key={point.loc.id}
              type="button"
              onClick={() => onSelect?.(point.loc.id)}
              onMouseEnter={() => setHoveredId(point.loc.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(point.loc.id)}
              onBlur={() => setHoveredId(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{
                left: `${(point.x / W) * 100}%`,
                top: `${(point.y / H) * 100}%`,
              }}
              aria-label={`Select ${point.loc.name}`}
              title={`${point.loc.name} · ${point.loc.city} · ${compactEuro(point.weeklyForecast)} week`}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full border-2 border-background text-[10px] font-bold shadow-md transition-transform",
                  active && "ring-primary ring-2 ring-offset-2 ring-offset-background",
                  hoveredId === point.loc.id && "scale-110",
                  good ? "bg-success text-white" : "bg-danger text-white",
                )}
                style={{ width: size, height: size }}
              >
                {point.weeklyDeltaPct > 0 ? "+" : ""}
              </span>
              <span className="bg-background/92 mt-1 block max-w-24 truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold shadow-sm">
                {point.loc.name}
              </span>
            </button>
          );
        })}

        {!isLoading && !points.length && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Add Belgian city locations to plot them on the map.
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div className="rounded-md bg-background/90 px-2.5 py-1.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Week lift
            </p>
            <p className="text-xs">
              <span className="font-semibold text-success">Green</span>{" "}
              above baseline ·{" "}
              <span className="font-semibold text-danger">red</span> below
            </p>
          </div>
          {hovered && (
            <div className="max-w-36 rounded-md bg-background/95 px-2.5 py-1.5 text-right shadow-sm">
              <p className="truncate text-xs font-semibold">{hovered.loc.name}</p>
              <p className="text-muted-foreground text-[11px] tabular-nums">
                {compactEuro(hovered.weeklyForecast)} ·{" "}
                {hovered.weeklyDeltaPct > 0 ? "+" : ""}
                {hovered.weeklyDeltaPct}%
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
