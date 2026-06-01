"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export function todayInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function dateFromInput(value: string) {
  return new Date(`${value}T12:00:00`);
}

function shiftDate(value: string, days: number) {
  const date = dateFromInput(value);
  date.setDate(date.getDate() + days);
  return todayInputValue(date);
}

function weekRange(value: string) {
  const focus = dateFromInput(value);
  const day = (focus.getDay() + 6) % 7;
  const start = new Date(focus);
  start.setDate(focus.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    from: start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    }),
    to: end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    }),
  };
}

export function ForecastDateControl({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const range = weekRange(value);
  return (
    <Card className="p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Forecast week</p>
          <p className="text-muted-foreground text-xs">
            From {range.from} to {range.to} · focus day{" "}
            {dateFromInput(value).toLocaleDateString("en-GB", {
              weekday: compact ? "short" : "long",
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Previous week"
            onClick={() => onChange(shiftDate(value, -7))}
          >
            <Icon name="ChevronLeft" />
          </Button>
          <input
            type="date"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="field-input h-10 w-[9.25rem]"
            aria-label="Forecast date"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Next week"
            onClick={() => onChange(shiftDate(value, 7))}
          >
            <Icon name="ChevronRight" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange(todayInputValue())}
          >
            This week
          </Button>
        </div>
      </div>
    </Card>
  );
}
