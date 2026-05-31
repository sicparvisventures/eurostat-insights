"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { Metric } from "@/lib/eurostat/registry";

export interface DeltaResult {
  text: string; // e.g. "+1.2pp", "-4.4%", "+0.3"
  tone: "up" | "down" | "flat";
  good: boolean | null; // null = neutral metric
}

/**
 * The single source of truth for how a change is shown across the whole app.
 * Rules:
 * - percent metrics -> percentage points ("pp")
 * - compact / currency metrics -> percentage change ("%")
 * - everything else -> absolute change in the metric's own decimals
 */
export function computeDelta(
  metric: Pick<Metric, "format" | "decimals" | "trend">,
  current: number,
  previous: number | undefined,
): DeltaResult | null {
  if (previous === undefined || Number.isNaN(previous)) return null;
  const diff = current - previous;
  const minus = "-";
  const sign = diff > 0 ? "+" : diff < 0 ? minus : "";
  const abs = Math.abs(diff);

  let text: string;
  if (metric.format === "percent") {
    text = `${sign}${abs.toFixed(metric.decimals ?? 1)}pp`;
  } else if (metric.format === "compact" || metric.format === "currency") {
    const pct = previous ? (diff / Math.abs(previous)) * 100 : 0;
    text = `${pct > 0 ? "+" : pct < 0 ? minus : ""}${Math.abs(pct).toFixed(1)}%`;
  } else {
    text = `${sign}${abs.toFixed(metric.decimals ?? 1)}`;
  }

  const tone = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const good: boolean | null =
    metric.trend === "neutral"
      ? null
      : metric.trend === "up-good"
        ? diff > 0
        : diff < 0;

  return { text, tone, good: diff === 0 ? null : good };
}

export function DeltaBadge({
  metric,
  current,
  previous,
  period,
  size = "sm",
  className,
}: {
  metric: Pick<Metric, "format" | "decimals" | "trend">;
  current: number;
  previous: number | undefined;
  /** Optional "vs 2024" caption to make the comparison explicit. */
  period?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const d = computeDelta(metric, current, previous);
  if (!d) return null;

  const color =
    d.good === null
      ? "text-muted-foreground"
      : d.good
        ? "text-success"
        : "text-danger";

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-semibold tabular-nums",
          size === "md" ? "text-sm" : "text-xs",
          color,
        )}
      >
        <Icon
          name={
            d.tone === "up"
              ? "ArrowUpRight"
              : d.tone === "down"
                ? "ArrowDownRight"
                : "ArrowRight"
          }
          className={size === "md" ? "size-3.5" : "size-3"}
        />
        {d.text}
      </span>
      {period && (
        <span className="text-muted-foreground text-[11px]">{period}</span>
      )}
    </span>
  );
}

/** Human label for the comparison period, based on metric frequency. */
export function periodLabel(
  frequency: Metric["frequency"],
  prevTime?: string,
): string {
  if (!prevTime) return "";
  if (frequency === "M") return `vs ${prevTime}`;
  if (frequency === "Q") return `vs ${prevTime}`;
  return `vs ${prevTime}`;
}
