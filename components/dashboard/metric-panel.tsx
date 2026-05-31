"use client";

import { useMetricSeries } from "@/lib/hooks/use-eurostat";
import { timeSeries } from "@/lib/eurostat/jsonstat";
import { formatMetricValue, type Metric } from "@/lib/eurostat/registry";
import { countryName } from "@/lib/eurostat/constants";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { ChartSkeleton, EmptyState, ErrorState } from "@/components/charts/states";
import { cn } from "@/lib/utils";

export function MetricPanel({
  metric,
  country,
  periods = 16,
  color = "var(--color-chart-1)",
}: {
  metric: Metric;
  country: string;
  periods?: number;
  color?: string;
}) {
  const { data, isLoading, isError, refetch } = useMetricSeries(
    metric,
    country,
    periods,
  );
  const series = data ? timeSeries(data, metric.filters) : [];
  const latest = series.at(-1);
  const prev = series.at(-2);
  const delta = latest && prev ? latest.value - prev.value : 0;
  const good =
    metric.trend === "up-good"
      ? delta > 0
      : metric.trend === "down-good"
        ? delta < 0
        : null;

  return (
    <Card className="overflow-hidden p-5">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{metric.title}</h3>
          <p className="text-muted-foreground text-xs">
            {countryName(country)} · {metric.description}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4">
          <ChartSkeleton height={200} />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !latest ? (
        <EmptyState message="No data for this country and indicator." />
      ) : (
        <>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-3xl font-bold tracking-tight tabular-nums">
              {formatMetricValue(metric, latest.value)}
            </span>
            {prev && (
              <span
                className={cn(
                  "mb-1 inline-flex items-center gap-0.5 text-sm font-semibold tabular-nums",
                  good === null
                    ? "text-muted-foreground"
                    : good
                      ? "text-success"
                      : "text-danger",
                )}
              >
                <Icon
                  name={delta >= 0 ? "TrendingUp" : "TrendingDown"}
                  className="size-4"
                />
                {delta >= 0 ? "+" : ""}
                {delta.toFixed(metric.decimals ?? 1)}
                {metric.format === "percent" ? "pp" : ""}
              </span>
            )}
            <span className="text-muted-foreground mb-1 ml-auto text-xs">
              {latest.time}
            </span>
          </div>

          <div className="mt-4">
            <TimeSeriesChart
              series={[
                {
                  id: metric.id,
                  name: metric.short,
                  color,
                  data: series,
                },
              ]}
              height={200}
              formatValue={(v) => formatMetricValue(metric, v)}
            />
          </div>
        </>
      )}
    </Card>
  );
}
