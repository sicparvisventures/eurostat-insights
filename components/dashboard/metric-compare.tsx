"use client";

import { useMemo } from "react";
import { useMetricByCountry } from "@/lib/hooks/use-eurostat";
import { timeSeries } from "@/lib/eurostat/jsonstat";
import { formatMetricValue, type Metric } from "@/lib/eurostat/registry";
import { EU_COUNTRY_CODES } from "@/lib/eurostat/constants";
import type { DataRange } from "@/lib/date-range";
import { EuropeChoropleth } from "@/components/charts/europe-choropleth";
import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart";
import { ChartSkeleton, EmptyState, ErrorState } from "@/components/charts/states";

export function MetricCompare({
  metric,
  selected,
  onSelectCountry,
  range,
}: {
  metric: Metric;
  selected: string;
  onSelectCountry: (code: string) => void;
  range?: DataRange;
}) {
  const { data, isLoading, isError, refetch } = useMetricByCountry(
    metric,
    range ?? 8,
  );

  const { values, bars, time } = useMemo(() => {
    if (!data) return { values: new Map<string, number>(), bars: [], time: "" };
    const values = new Map<string, number>();
    const bars: { code: string; label: string; value: number }[] = [];
    let latestTime = "";
    for (const g of data.dims.geo?.categories ?? []) {
      if (!EU_COUNTRY_CODES.has(g.code)) continue;
      // Latest non-null value for this country across the fetched periods.
      const series = timeSeries(data, { ...metric.filters, geo: g.code });
      const last = series.at(-1);
      if (!last) continue;
      values.set(g.code, last.value);
      bars.push({ code: g.code, label: g.label, value: last.value });
      if (last.time > latestTime) latestTime = last.time;
    }
    return { values, bars, time: latestTime };
  }, [data, metric.filters]);

  const fmt = (v: number) => formatMetricValue(metric, v);

  if (isLoading) return <ChartSkeleton height={320} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!values.size)
    return <EmptyState message="No country comparison available." />;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-muted-foreground mb-2 text-xs">
          {metric.title} across Europe · {time}
        </p>
        <EuropeChoropleth
          values={values}
          selected={selected}
          onSelect={onSelectCountry}
          formatValue={fmt}
        />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">
          Top countries
        </p>
        <ComparisonBarChart
          data={bars}
          highlight={selected}
          formatValue={fmt}
          limit={12}
        />
      </div>
    </div>
  );
}
