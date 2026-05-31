"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  currentMonth,
  rangeLabel,
  RANGE_PRESETS,
  type DataRange,
  type RangePreset,
} from "@/lib/date-range";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  value,
  onChange,
  className,
}: {
  value: DataRange;
  onChange: (range: DataRange) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DataRange>(value);

  function selectPreset(preset: RangePreset) {
    setDraft((range) => ({
      preset,
      start: preset === "custom" ? (range.start ?? currentMonth()) : undefined,
      end: preset === "custom" ? (range.end ?? currentMonth()) : undefined,
    }));
  }

  function apply() {
    onChange(draft);
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className={cn("shrink-0", className)}
        onClick={() => {
          setDraft(value);
          setOpen(true);
        }}
      >
        <Icon name="CalendarDays" />
        {rangeLabel(value)}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-3 pb-3 pt-12 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Select data range"
        >
          <button
            className="absolute inset-0"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="bg-card relative w-full max-w-lg overflow-hidden rounded-[26px] border border-border shadow-2xl">
            <div className="border-border flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold tracking-tight">Data range</h2>
                <p className="text-muted-foreground text-xs">
                  Pick a preset or select months.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="hover:bg-muted flex size-9 items-center justify-center rounded-full"
              >
                <Icon name="X" className="size-4" />
              </button>
            </div>

            <div className="max-h-[70dvh] overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-2.5">
                {RANGE_PRESETS.map((preset) => {
                  const active = draft.preset === preset.value;
                  return (
                    <button
                      key={preset.value}
                      onClick={() => selectPreset(preset.value)}
                      aria-pressed={active}
                      className={cn(
                        "min-h-24 rounded-2xl border p-3 text-left transition-all active:scale-[0.99]",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      <p className="font-semibold">{preset.label}</p>
                      <p
                        className={cn(
                          "mt-1 line-clamp-2 text-xs leading-relaxed",
                          active
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground",
                        )}
                      >
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {draft.preset === "custom" && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label>
                    <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                      Start month
                    </span>
                    <input
                      type="month"
                      value={draft.start ?? ""}
                      max={draft.end}
                      onChange={(e) =>
                        setDraft((range) => ({
                          ...range,
                          start: e.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                  <label>
                    <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                      End month
                    </span>
                    <input
                      type="month"
                      value={draft.end ?? ""}
                      min={draft.start}
                      max={currentMonth()}
                      onChange={(e) =>
                        setDraft((range) => ({
                          ...range,
                          end: e.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="border-border flex gap-3 border-t p-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" className="flex-1" onClick={apply}>
                Apply
                <Icon name="Check" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
