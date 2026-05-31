import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with locale-aware thousands separators and optional unit. */
export function formatNumber(
  value: number | null | undefined,
  opts: { decimals?: number; compact?: boolean; unit?: string } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  const { decimals, compact, unit } = opts;
  const formatted = new Intl.NumberFormat("en-GB", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: decimals ?? (Math.abs(value) >= 100 ? 0 : 1),
    minimumFractionDigits: 0,
  }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

/** Percentage delta between two numbers, signed. */
export function pctChange(from: number, to: number): number | null {
  if (!from || Number.isNaN(from) || Number.isNaN(to)) return null;
  return ((to - from) / Math.abs(from)) * 100;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
