"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { countryName } from "@/lib/eurostat/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface GeoProps {
  id: string;
  name: string;
  eu: boolean;
}

const W = 480;
const H = 440;

function useEuropeGeo() {
  return useQuery({
    queryKey: ["europe-geo"],
    queryFn: async () => {
      const res = await fetch("/geo/europe.geojson");
      return (await res.json()) as FeatureCollection<Geometry, GeoProps>;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function EuropeChoropleth({
  values,
  selected,
  onSelect,
  formatValue = (v) => String(v),
}: {
  values: Map<string, number>;
  selected?: string;
  onSelect?: (code: string) => void;
  formatValue?: (v: number) => string;
}) {
  const { data: geo, isLoading } = useEuropeGeo();
  const [hovered, setHovered] = useState<string | null>(null);

  const { paths, min, max } = useMemo(() => {
    if (!geo) return { paths: [], min: 0, max: 1 };
    const euFeatures = {
      ...geo,
      features: geo.features.filter((f) => f.properties.eu),
    };
    const projection = geoMercator().fitSize([W, H], euFeatures);
    const path = geoPath(projection);
    const vals = [...values.values()].filter(Number.isFinite);
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 1;
    const paths = geo.features.map((f) => ({
      id: f.properties.id,
      name: f.properties.name,
      d: path(f) ?? "",
      value: values.get(f.properties.id),
    }));
    return { paths, min, max };
  }, [geo, values]);

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;

  const range = max - min || 1;
  const caption = hovered ?? selected;
  const captionValue = caption ? values.get(caption) : undefined;

  return (
    <div className="select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Map of Europe coloured by value"
      >
        {paths.map((p) => {
          const hasValue = p.value != null && Number.isFinite(p.value);
          const norm = hasValue ? (p.value! - min) / range : 0;
          const isSel = p.id === selected;
          return (
            <path
              key={p.id}
              d={p.d}
              fill={hasValue ? "var(--color-chart-1)" : "var(--color-muted)"}
              fillOpacity={hasValue ? 0.18 + norm * 0.8 : 0.6}
              stroke={
                isSel ? "var(--color-foreground)" : "var(--color-background)"
              }
              strokeWidth={isSel ? 1.6 : 0.5}
              className={hasValue ? "cursor-pointer" : ""}
              onMouseEnter={() => hasValue && setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => hasValue && onSelect?.(p.id)}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between px-1">
        <div className="text-sm">
          {caption ? (
            <>
              <span className="font-semibold">{countryName(caption)}</span>
              {captionValue != null && (
                <span className="text-muted-foreground">
                  {" · "}
                  {formatValue(captionValue)}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-xs">
              Tap a country to explore
            </span>
          )}
        </div>
        <Legend min={min} max={max} formatValue={formatValue} />
      </div>
    </div>
  );
}

function Legend({
  min,
  max,
  formatValue,
}: {
  min: number;
  max: number;
  formatValue: (v: number) => string;
}) {
  const steps = [0.2, 0.4, 0.6, 0.8, 1];
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground text-[10px] tabular-nums">
        {formatValue(min)}
      </span>
      <div className="flex overflow-hidden rounded-sm">
        {steps.map((s) => (
          <span
            key={s}
            className="h-2.5 w-3.5"
            style={{
              background: "var(--color-chart-1)",
              opacity: 0.18 + s * 0.8,
            }}
          />
        ))}
      </div>
      <span className="text-muted-foreground text-[10px] tabular-nums">
        {formatValue(max)}
      </span>
    </div>
  );
}
