"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  datasetQueryKey,
  fetchDataset,
} from "@/lib/eurostat/client";
import { latestByGeo } from "@/lib/eurostat/jsonstat";
import { formatMetricValue, type Metric } from "@/lib/eurostat/registry";
import {
  EU_COUNTRY_CODES,
  countryDisplayCode,
} from "@/lib/eurostat/constants";
import { rangeToFetchParams, type DataRange } from "@/lib/date-range";
import { ChartSkeleton, EmptyState } from "@/components/charts/states";
import { cn } from "@/lib/utils";

const MAX_ROWS = 14;

interface Column {
  metric: Metric;
  values: Map<string, number>;
  min: number;
  max: number;
}

/**
 * Countries × metrics colour-coded matrix. Each column is normalised on its own
 * scale, so a glance shows who leads on each indicator while the actual value
 * stays readable in every cell.
 */
export function RankingHeatmap({
  metrics,
  selected,
  onSelectCountry,
  range,
  color = "var(--color-chart-1)",
}: {
  metrics: Metric[];
  selected: string;
  onSelectCountry?: (code: string) => void;
  range?: DataRange;
  color?: string;
}) {
  const results = useQueries({
    queries: metrics.map((m) => {
      const params = {
        dataset: m.datasetCode,
        filters: m.filters,
        ...(range
          ? rangeToFetchParams(range, m.frequency)
          : { lastTimePeriod: 12 }),
      };
      return {
        queryKey: datasetQueryKey(params),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          fetchDataset(params, signal),
      };
    }),
  });

  const { columns, rows } = useMemo(() => {
    const columns: Column[] = metrics.map((metric, i) => {
      const data = results[i].data;
      const values = new Map<string, number>();
      if (data) {
        for (const [code, point] of latestByGeo(data, metric.filters)) {
          if (EU_COUNTRY_CODES.has(code)) values.set(code, point.value);
        }
      }
      const nums = [...values.values()];
      return {
        metric,
        values,
        min: nums.length ? Math.min(...nums) : 0,
        max: nums.length ? Math.max(...nums) : 1,
      };
    });

    // Rank rows by average normalised score across the metrics with data.
    const codes = new Set<string>();
    columns.forEach((c) => c.values.forEach((_, code) => codes.add(code)));
    const scored = [...codes].map((code) => {
      let sum = 0;
      let n = 0;
      for (const c of columns) {
        const v = c.values.get(code);
        if (v == null) continue;
        sum += (v - c.min) / (c.max - c.min || 1);
        n += 1;
      }
      return { code, score: n ? sum / n : 0, coverage: n };
    });
    scored.sort((a, b) => b.coverage - a.coverage || b.score - a.score);

    const top = scored.slice(0, MAX_ROWS);
    if (selected && !top.some((r) => r.code === selected)) {
      const sel = scored.find((r) => r.code === selected);
      if (sel) top[top.length - 1] = sel;
    }
    return { columns, rows: top };
  }, [results, metrics, selected]);

  const anyLoading = results.some((r) => r.isLoading);
  if (anyLoading && rows.length === 0) return <ChartSkeleton height={280} />;
  if (!rows.length)
    return <EmptyState message="No country ranking available." />;

  return (
    <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="sticky left-0 z-10" />
            {columns.map((c) => (
              <th
                key={c.metric.id}
                className="text-muted-foreground px-1 pb-1 text-center text-[10px] font-medium"
              >
                {c.metric.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSel = row.code === selected;
            return (
              <tr key={row.code}>
                <td
                  className={cn(
                    "sticky left-0 z-10 pr-1 font-mono text-[11px] font-semibold tabular-nums",
                    isSel ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <button
                    onClick={() => onSelectCountry?.(row.code)}
                    className={cn(
                      "bg-background rounded-md px-1.5 py-1",
                      isSel && "ring-primary ring-2",
                    )}
                  >
                    {countryDisplayCode(row.code)}
                  </button>
                </td>
                {columns.map((c) => {
                  const v = c.values.get(row.code);
                  const has = v != null;
                  const norm = has ? (v - c.min) / (c.max - c.min || 1) : 0;
                  const pct = Math.round((0.1 + norm * 0.65) * 100);
                  return (
                    <td key={c.metric.id} className="p-0">
                      <div
                        className={cn(
                          "text-foreground rounded-md px-1.5 py-1.5 text-center text-[11px] font-medium tabular-nums",
                          isSel && "ring-primary/40 ring-1",
                        )}
                        style={{
                          background: has
                            ? `color-mix(in oklch, ${color} ${pct}%, transparent)`
                            : "color-mix(in oklch, var(--color-muted) 40%, transparent)",
                        }}
                        title={has ? formatMetricValue(c.metric, v) : "No data"}
                      >
                        {has ? formatMetricValue(c.metric, v) : "–"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
