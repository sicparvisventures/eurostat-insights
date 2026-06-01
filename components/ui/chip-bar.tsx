"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ChipOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Native tooltip / full name (used for icon-only or abbreviated chips). */
  title?: string;
  ariaLabel?: string;
}

function Track({
  children,
  ariaLabel,
  className,
  role,
}: {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  role?: string;
}) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={cn("w-full overflow-hidden", className)}
    >
      <div className="no-scrollbar border-border bg-muted/60 flex gap-1.5 overflow-x-auto rounded-xl border p-1">
        {children}
      </div>
    </div>
  );
}

function Chip<T extends string>({
  opt,
  active,
  onClick,
  mono,
  role,
}: {
  opt: ChipOption<T>;
  active: boolean;
  onClick: () => void;
  mono: boolean;
  role: "radio" | "checkbox";
}) {
  return (
    <button
      onClick={onClick}
      role={role}
      aria-checked={active}
      aria-label={opt.ariaLabel}
      title={opt.title}
      className={cn(
        "flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-[13px] font-semibold transition-colors active:scale-95",
        mono ? "min-w-12 font-mono tracking-normal" : "whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background hover:text-foreground",
      )}
    >
      {opt.label}
    </button>
  );
}

/**
 * The canonical segmented chip selector used across the app: a single muted
 * track holding pill buttons that scrolls horizontally on overflow. Country,
 * metric and theme selectors all share this look for visual consistency.
 */
export function ChipBar<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  mono = false,
  className,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  /** Fixed-width monospace chips (used for country codes). */
  mono?: boolean;
  className?: string;
}) {
  return (
    <Track role="radiogroup" ariaLabel={ariaLabel} className={className}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          opt={opt}
          active={opt.value === value}
          onClick={() => onChange(opt.value)}
          mono={mono}
          role="radio"
        />
      ))}
    </Track>
  );
}

/** Multi-select sibling of {@link ChipBar} — same look, toggles membership. */
export function ChipBarMulti<T extends string>({
  options,
  values,
  onToggle,
  ariaLabel,
  mono = false,
  className,
}: {
  options: ChipOption<T>[];
  values: T[];
  onToggle: (value: T) => void;
  ariaLabel?: string;
  mono?: boolean;
  className?: string;
}) {
  const set = new Set(values);
  return (
    <Track role="group" ariaLabel={ariaLabel} className={className}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          opt={opt}
          active={set.has(opt.value)}
          onClick={() => onToggle(opt.value)}
          mono={mono}
          role="checkbox"
        />
      ))}
    </Track>
  );
}
