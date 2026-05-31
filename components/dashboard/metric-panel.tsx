"use client";

import Link from "next/link";
import { useMetricSeries } from "@/lib/hooks/use-eurostat";
import { timeSeries } from "@/lib/eurostat/jsonstat";
import { formatMetricValue, type Metric } from "@/lib/eurostat/registry";
import { countryName } from "@/lib/eurostat/constants";
import type { DataRange } from "@/lib/date-range";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { DeltaBadge, periodLabel } from "@/components/charts/delta-badge";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { ChartSkeleton, EmptyState, ErrorState } from "@/components/charts/states";

export function MetricPanel({
  metric,
  country,
  periods = 16,
  range,
  color = "var(--color-chart-1)",
}: {
  metric: Metric;
  country: string;
  periods?: number;
  range?: DataRange;
  color?: string;
}) {
  const { data, isLoading, isError, refetch } = useMetricSeries(
    metric,
    country,
    range ?? periods,
  );
  const series = data ? timeSeries(data, metric.filters) : [];
  const latest = series.at(-1);
  const prev = series.at(-2);

  return (
    <Card className="overflow-hidden p-5">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{metric.title}</h3>
          <p className="text-muted-foreground text-xs">
            {countryName(country)} · {metric.description}
          </p>
        </div>
        <Button asChild size="sm" variant="ghost" className="-mr-2 -mt-2">
          <Link href={`/dataset/${metric.datasetCode}`}>
            <Icon name="ArrowUpRight" />
            Details
          </Link>
        </Button>
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
            <DeltaBadge
              metric={metric}
              current={latest.value}
              previous={prev?.value}
              period={periodLabel(metric.frequency, prev?.time)}
              size="md"
              className="mb-1"
            />
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
