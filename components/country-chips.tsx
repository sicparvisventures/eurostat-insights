"use client";

import { EU_AGGREGATE, EU_COUNTRIES } from "@/lib/eurostat/constants";
import { cn } from "@/lib/utils";

const ALL = [EU_AGGREGATE, ...EU_COUNTRIES];

export function CountryChips({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (code: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5", className)}
    >
      {ALL.map((c) => {
        const active = c.code === value;
        return (
          <button
            key={c.code}
            onClick={() => onChange(c.code)}
            aria-pressed={active}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all active:scale-95",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            <span className="text-base leading-none">{c.flag}</span>
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
