"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
          {label}
        </span>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-border bg-card focus:border-primary focus:ring-primary/20 w-full appearance-none rounded-xl border py-2.5 pl-3.5 pr-9 text-sm font-medium outline-none transition-colors focus:ring-4"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="ChevronRight"
          className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90"
        />
      </div>
    </label>
  );
}
