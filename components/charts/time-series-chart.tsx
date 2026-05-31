"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BORDER, MUTED_FG } from "./palette";
import { formatTimeLabel } from "./palette";

export interface ChartSeries {
  id: string;
  name: string;
  color: string;
  data: { time: string; value: number }[];
}

interface Props {
  series: ChartSeries[];
  height?: number;
  formatValue?: (v: number) => string;
}

/** Merge multiple series into rows keyed by time period. */
function mergeRows(series: ChartSeries[]) {
  const times = new Set<string>();
  series.forEach((s) => s.data.forEach((d) => times.add(d.time)));
  const sorted = [...times].sort();
  const lookup = series.map((s) => new Map(s.data.map((d) => [d.time, d.value])));
  return sorted.map((time) => {
    const row: Record<string, string | number | null> = { time };
    series.forEach((s, i) => {
      row[s.id] = lookup[i].get(time) ?? null;
    });
    return row;
  });
}

function TooltipBox({
  active,
  payload,
  label,
  series,
  formatValue,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number | string }[];
  label?: string;
  series: ChartSeries[];
  formatValue: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 rounded-xl border border-border px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="text-muted-foreground mb-1 font-medium">
        {formatTimeLabel(String(label))}
      </p>
      {payload.map((p) => {
        const s = series.find((x) => x.id === p.dataKey);
        if (!s || p.value == null) return null;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-foreground font-semibold tabular-nums">
              {formatValue(Number(p.value))}
            </span>
            {series.length > 1 && (
              <span className="text-muted-foreground">{s.name}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TimeSeriesChart({
  series,
  height = 240,
  formatValue = (v) => String(v),
}: Props) {
  const rows = mergeRows(series);
  const single = series.length === 1;

  // Padded, non-zero-based domain so subtle trends stay visible.
  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const dataMin = allValues.length ? Math.min(...allValues) : 0;
  const dataMax = allValues.length ? Math.max(...allValues) : 1;
  const pad = (dataMax - dataMin || Math.abs(dataMax) || 1) * 0.12;
  const domain: [number, number] = [dataMin - pad, dataMax + pad];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke={BORDER}
          strokeDasharray="3 3"
          opacity={0.6}
        />
        <XAxis
          dataKey="time"
          tickFormatter={formatTimeLabel}
          tick={{ fontSize: 11, fill: MUTED_FG }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: MUTED_FG }}
          tickLine={false}
          axisLine={false}
          width={44}
          domain={domain}
          tickFormatter={(v) => formatValue(Number(v))}
        />
        <Tooltip
          content={
            <TooltipBox series={series} formatValue={formatValue} />
          }
          cursor={{ stroke: BORDER, strokeWidth: 1 }}
        />
        {series.map((s) =>
          single ? (
            <Area
              key={s.id}
              type="monotone"
              dataKey={s.id}
              stroke={s.color}
              strokeWidth={2}
              fill={s.color}
              fillOpacity={0.08}
              connectNulls
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 0 }}
            />
          ) : (
            <Line
              key={s.id}
              type="monotone"
              dataKey={s.id}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{ r: 3.5, strokeWidth: 0 }}
            />
          ),
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
