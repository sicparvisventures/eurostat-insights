"use client";

import { Card } from "@/components/ui/card";
import { eur } from "@/components/business/business-widgets";
import { cn } from "@/lib/utils";

export interface MonthForecastDay {
  date: Date;
  revenue: number;
  baseline: number;
  covers: number;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthGrid(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function key(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ForecastMonthView({
  anchor,
  days,
  selectedDate,
  onSelectDate,
}: {
  anchor: Date;
  days: MonthForecastDay[];
  selectedDate: string;
  onSelectDate: (value: string) => void;
}) {
  const values = new Map(days.map((day) => [key(day.date), day]));
  const max = Math.max(...days.map((day) => day.revenue), 1);
  const cells = monthGrid(anchor);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <p className="font-semibold">
            {anchor.toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-muted-foreground text-xs">
            Forecast revenue by day; click a day to focus the model.
          </p>
        </div>
        <span className="text-muted-foreground text-xs">
          {eur(days.reduce((sum, day) => sum + day.revenue, 0))}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="text-muted-foreground pb-1 text-center text-[10px] font-semibold"
          >
            {weekday}
          </div>
        ))}
        {cells.map((date) => {
          const value = values.get(key(date));
          const inMonth = date.getMonth() === anchor.getMonth();
          const selected = key(date) === selectedDate;
          const intensity = value ? 12 + (value.revenue / max) * 58 : 0;
          return (
            <button
              key={key(date)}
              type="button"
              onClick={() => onSelectDate(key(date))}
              className={cn(
                "min-h-16 rounded-lg border p-1.5 text-left transition-colors",
                inMonth ? "border-border" : "border-transparent opacity-45",
                selected && "ring-primary ring-2",
              )}
              style={{
                background: value
                  ? `color-mix(in oklch, var(--color-primary) ${intensity}%, transparent)`
                  : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[11px] font-semibold">
                  {date.getDate()}
                </span>
                {value && value.revenue !== value.baseline && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      value.revenue >= value.baseline
                        ? "text-success"
                        : "text-danger",
                    )}
                  >
                    {value.revenue > value.baseline ? "+" : ""}
                    {Math.round((value.revenue / value.baseline - 1) * 100)}%
                  </span>
                )}
              </div>
              {value && (
                <div className="mt-3">
                  <p className="truncate text-xs font-bold tabular-nums">
                    {eur(value.revenue)}
                  </p>
                  <p className="text-muted-foreground truncate text-[10px]">
                    {value.covers} covers
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
