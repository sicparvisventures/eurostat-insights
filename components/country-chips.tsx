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
      role="radiogroup"
      aria-label="Country or region"
      className={cn("w-full overflow-hidden", className)}
    >
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-muted/60 p-1">
        {ALL.map((c) => {
          const active = c.code === value;
          return (
            <button
              key={c.code}
              onClick={() => onChange(c.code)}
              role="radio"
              aria-checked={active}
              aria-label={c.name}
              title={c.name}
              className={cn(
                "flex h-9 min-w-12 shrink-0 items-center justify-center rounded-lg px-3 font-mono text-[13px] font-semibold tracking-normal transition-colors active:scale-95",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              {c.displayCode}
            </button>
          );
        })}
      </div>
    </div>
  );
}
