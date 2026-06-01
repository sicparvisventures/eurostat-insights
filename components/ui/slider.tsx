"use client";

import { cn } from "@/lib/utils";

/**
 * Labeled range slider used across Business Mode onboarding and settings. Keeps
 * configuration fast: drag to set, with a live formatted value and optional hint.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  hint,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-muted-foreground text-xs font-medium">
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className={cn("ei-range")}
      />
      {hint && (
        <p className="text-muted-foreground/70 mt-1 text-[11px] leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}
