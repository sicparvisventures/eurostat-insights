"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MUTED_FG } from "./palette";

export interface BarDatum {
  code: string;
  label: string;
  value: number;
}

interface Props {
  data: BarDatum[];
  highlight?: string;
  formatValue?: (v: number) => string;
  /** Max bars to show. */
  limit?: number;
  height?: number;
}

export function ComparisonBarChart({
  data,
  highlight,
  formatValue = (v) => String(v),
  limit = 12,
  height,
}: Props) {
  const sorted = [...data]
    .filter((d) => Number.isFinite(d.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  const h = height ?? Math.max(160, sorted.length * 30 + 20);

  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        layout="vertical"
        data={sorted}
        margin={{ top: 0, right: 44, left: 0, bottom: 0 }}
        barCategoryGap={6}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={92}
          tick={{ fontSize: 11, fill: MUTED_FG }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="bg-card/95 rounded-xl border border-border px-3 py-1.5 text-xs shadow-lg backdrop-blur">
                <span className="text-muted-foreground">
                  {payload[0].payload.label}:{" "}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatValue(Number(payload[0].value))}
                </span>
              </div>
            ) : null
          }
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive>
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v) => formatValue(Number(v))}
            style={{ fontSize: 11, fill: MUTED_FG, fontWeight: 600 }}
          />
          {sorted.map((d) => (
            <Cell
              key={d.code}
              fill="var(--color-chart-1)"
              fillOpacity={d.code === highlight ? 1 : 0.4}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
