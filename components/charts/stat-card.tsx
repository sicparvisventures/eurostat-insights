"use client";

import Link from "next/link";
import { useMetricSeries } from "@/lib/hooks/use-eurostat";
import { timeSeries } from "@/lib/eurostat/jsonstat";
import {
  formatMetricValue,
  type Metric,
} from "@/lib/eurostat/registry";
import { countryName } from "@/lib/eurostat/constants";
import { Sparkline } from "./sparkline";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function trendMeta(
  metric: Metric,
  delta: number,
): { color: string; icon: string } {
  const good =
    metric.trend === "up-good"
      ? delta > 0
      : metric.trend === "down-good"
        ? delta < 0
        : null;
  if (good === null || delta === 0)
    return { color: "text-muted-foreground", icon: delta >= 0 ? "TrendingUp" : "TrendingDown" };
  return {
    color: good ? "text-success" : "text-danger",
    icon: delta > 0 ? "TrendingUp" : "TrendingDown",
  };
}

export function StatCard({
  metric,
  country,
  href,
  className,
  color = "var(--color-chart-1)",
}: {
  metric: Metric;
  country: string;
  href?: string;
  className?: string;
  color?: string;
}) {
  const { data, isLoading, isError } = useMetricSeries(metric, country, 16);
  const series = data ? timeSeries(data, metric.filters) : [];
  const latest = series.at(-1);
  const prev = series.at(-2);
  const delta = latest && prev ? latest.value - prev.value : 0;
  const pct = prev && prev.value ? (delta / Math.abs(prev.value)) * 100 : 0;
  const showPct = metric.format === "compact" || metric.format === "currency";
  const trend = trendMeta(metric, delta);

  const inner = (
    <div
      className={cn(
        "group bg-card relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 p-4 shadow-sm transition-all",
        href && "hover:border-primary/40 active:scale-[0.99]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-xs font-medium">
            {metric.short}
          </p>
          <p className="text-muted-foreground/70 truncate text-[10px]">
            {countryName(country)}
          </p>
        </div>
        {href && (
          <Icon
            name="ArrowUpRight"
            className="text-muted-foreground/40 group-hover:text-primary size-4 shrink-0 transition-colors"
          />
        )}
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-10 w-full" />
        </>
      ) : isError || !latest ? (
        <p className="text-muted-foreground py-3 text-sm">No data</p>
      ) : (
        <>
          <div className="flex items-end justify-between gap-2">
            <div className="text-2xl font-bold tracking-tight tabular-nums">
              {formatMetricValue(metric, latest.value)}
            </div>
            {prev && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold tabular-nums",
                  trend.color,
                )}
              >
                <Icon name={trend.icon} className="size-3.5" />
                {showPct
                  ? `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`
                  : `${delta >= 0 ? "+" : ""}${delta.toFixed(metric.decimals ?? 1)}`}
              </div>
            )}
          </div>
          <Sparkline
            data={series.map((d) => d.value)}
            width={240}
            height={42}
            className="w-full"
            color={color}
          />
        </>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
