"use client";

import { useMemo, useState } from "react";
import { useMetricByCountry } from "@/lib/hooks/use-eurostat";
import { timeSeries } from "@/lib/eurostat/jsonstat";
import {
  formatMetricValue,
  metricUnitSuffix,
  type Metric,
} from "@/lib/eurostat/registry";
import {
  EU_AGGREGATE,
  EU_COUNTRIES,
  countryDisplayCode,
  countryName,
} from "@/lib/eurostat/constants";
import type { DataRange } from "@/lib/date-range";
import { ChipBar, ChipBarMulti } from "@/components/ui/chip-bar";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { DeltaBadge } from "@/components/charts/delta-badge";
import { colorAt } from "@/components/charts/palette";
import {
  ChartSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/charts/states";

const MAX_COUNTRIES = 4;

const COUNTRY_OPTIONS = [EU_AGGREGATE, ...EU_COUNTRIES].map((c) => ({
  value: c.code,
  label: c.displayCode,
  title: c.name,
  ariaLabel: c.name,
}));

/** A second, distinct default country so the comparison starts populated. */
function seedSecond(first: string): string {
  return ["ES", "FR", "IT", "DE"].find((c) => c !== first) ?? "ES";
}

export function CountryCompare({
  metrics,
  selected,
  range,
}: {
  metrics: Metric[];
  selected: string;
  range?: DataRange;
}) {
  const [countries, setCountries] = useState<string[]>(() => [
    selected,
    seedSecond(selected),
  ]);
  const [metricId, setMetricId] = useState(metrics[0]?.id ?? "");
  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0];

  const { data, isLoading, isError, refetch } = useMetricByCountry(
    metric,
    range ?? 60,
  );

  const fmt = (v: number) => formatMetricValue(metric, v);

  const lines = useMemo(() => {
    if (!data) return [];
    return countries.map((code, i) => ({
      id: code,
      name: countryDisplayCode(code),
      color: colorAt(i),
      data: timeSeries(data, { ...metric.filters, geo: code }),
    }));
  }, [data, countries, metric.filters]);

  function toggleCountry(code: string) {
    setCountries((prev) => {
      if (prev.includes(code)) {
        return prev.length > 1 ? prev.filter((c) => c !== code) : prev;
      }
      if (prev.length >= MAX_COUNTRIES) return prev;
      return [...prev, code];
    });
  }

  return (
    <div className="space-y-4">
      <ChipBar
        options={metrics.map((m) => ({ value: m.id, label: m.short }))}
        value={metric.id}
        onChange={setMetricId}
        ariaLabel="Metric to compare"
      />

      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">
          Pick up to {MAX_COUNTRIES} countries
        </p>
        <ChipBarMulti
          options={COUNTRY_OPTIONS}
          values={countries}
          onToggle={toggleCountry}
          ariaLabel="Countries to compare"
          mono
        />
      </div>

      {isLoading ? (
        <ChartSkeleton height={240} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : lines.every((l) => l.data.length === 0) ? (
        <EmptyState message="No data for these countries and indicator." />
      ) : (
        <>
          <p className="text-muted-foreground text-xs">
            {metric.title}
            {metricUnitSuffix(metric) ? ` · ${metricUnitSuffix(metric)}` : ""}
          </p>
          <TimeSeriesChart
            series={lines.filter((l) => l.data.length > 0)}
            height={240}
            formatValue={fmt}
          />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {lines.map((line, i) => {
              const latest = line.data.at(-1);
              const prev = line.data.at(-2);
              return (
                <div
                  key={line.id}
                  className="border-border bg-card rounded-xl border p-3"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: colorAt(i) }}
                    />
                    <span className="truncate text-xs font-semibold">
                      {countryName(line.id)}
                    </span>
                  </div>
                  {latest ? (
                    <>
                      <div className="text-lg font-bold tabular-nums">
                        {fmt(latest.value)}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <DeltaBadge
                          metric={metric}
                          current={latest.value}
                          previous={prev?.value}
                        />
                        <span className="text-muted-foreground/70 text-[10px] tabular-nums">
                          {latest.time}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground py-1 text-sm">No data</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
