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
import { DeltaBadge } from "./delta-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

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
            <DeltaBadge
              metric={metric}
              current={latest.value}
              previous={prev?.value}
            />
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
