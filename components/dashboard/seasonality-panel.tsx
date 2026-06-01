"use client";

import { useState } from "react";
import { useMetricSeries } from "@/lib/hooks/use-eurostat";
import { timeSeries } from "@/lib/eurostat/jsonstat";
import {
  formatMetricValue,
  metricUnitSuffix,
  type Metric,
} from "@/lib/eurostat/registry";
import { countryName } from "@/lib/eurostat/constants";
import type { DataRange } from "@/lib/date-range";
import { ChipBar } from "@/components/ui/chip-bar";
import { SeasonalityHeatmap } from "@/components/charts/seasonality-heatmap";
import {
  ChartSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/charts/states";

/**
 * Seasonality view for monthly metrics: pick an indicator and read its
 * month × year pattern for the selected country.
 */
export function SeasonalityPanel({
  metrics,
  country,
  range,
  color = "var(--color-chart-1)",
}: {
  metrics: Metric[];
  country: string;
  range?: DataRange;
  color?: string;
}) {
  const [metricId, setMetricId] = useState(metrics[0]?.id ?? "");
  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0];

  const { data, isLoading, isError, refetch } = useMetricSeries(
    metric,
    country,
    range ?? 60,
  );
  const series = data ? timeSeries(data, metric.filters) : [];

  return (
    <div className="space-y-4">
      <ChipBar
        options={metrics.map((m) => ({ value: m.id, label: m.short }))}
        value={metric.id}
        onChange={setMetricId}
        ariaLabel="Metric for seasonality"
      />
      <p className="text-muted-foreground text-xs">
        {countryName(country)} · {metric.title}
        {metricUnitSuffix(metric) ? ` · ${metricUnitSuffix(metric)}` : ""}
      </p>
      {isLoading ? (
        <ChartSkeleton height={220} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : series.length === 0 ? (
        <EmptyState message="No monthly data for this country and indicator." />
      ) : (
        <SeasonalityHeatmap
          series={series}
          color={color}
          formatValue={(v) => formatMetricValue(metric, v)}
        />
      )}
    </div>
  );
}
