"use client";

import { useMemo, useState } from "react";
import { formatTimeLabel } from "./palette";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

interface Cell {
  time: string;
  value: number | null;
}

/**
 * Month × year heatmap for a monthly series — makes tourism seasonality and
 * year-on-year shifts immediately legible. Colour intensity scales with value.
 */
export function SeasonalityHeatmap({
  series,
  formatValue = (v) => String(v),
  color = "var(--color-chart-1)",
}: {
  series: { time: string; value: number }[];
  formatValue?: (v: number) => string;
  color?: string;
}) {
  const [active, setActive] = useState<Cell | null>(null);

  const { rows, min, max } = useMemo(() => {
    const byYear = new Map<string, Map<number, number>>();
    let min = Infinity;
    let max = -Infinity;
    for (const p of series) {
      const m = p.time.match(/^(\d{4})-(\d{2})$/);
      if (!m) continue;
      const year = m[1];
      const month = Number(m[2]) - 1;
      if (!byYear.has(year)) byYear.set(year, new Map());
      byYear.get(year)!.set(month, p.value);
      if (p.value < min) min = p.value;
      if (p.value > max) max = p.value;
    }
    const rows = [...byYear.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([year, months]) => ({
        year,
        cells: MONTHS.map((_, i): Cell => ({
          time: `${year}-${String(i + 1).padStart(2, "0")}`,
          value: months.has(i) ? months.get(i)! : null,
        })),
      }));
    return { rows, min, max };
  }, [series]);

  if (!rows.length) return null;
  const range = max - min || 1;

  return (
    <div className="select-none">
      <div className="grid grid-cols-[1.6rem_repeat(12,1fr)] gap-1">
        <span />
        {MONTHS.map((m, i) => (
          <span
            key={i}
            className="text-muted-foreground/70 text-center text-[10px] font-medium"
          >
            {m}
          </span>
        ))}
        {rows.map((row) => (
          <FragmentRow
            key={row.year}
            row={row}
            min={min}
            range={range}
            color={color}
            onHover={setActive}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between px-0.5">
        <p className="text-sm">
          {active && active.value != null ? (
            <>
              <span className="text-muted-foreground">
                {formatTimeLabel(active.time)}
                {" · "}
              </span>
              <span className="font-semibold tabular-nums">
                {formatValue(active.value)}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs">
              Tap a month to read its value
            </span>
          )}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-[10px] tabular-nums">
            {formatValue(min)}
          </span>
          <div className="flex overflow-hidden rounded-sm">
            {[0.2, 0.4, 0.6, 0.8, 1].map((s) => (
              <span
                key={s}
                className="h-2.5 w-3.5"
                style={{ background: color, opacity: 0.15 + s * 0.85 }}
              />
            ))}
          </div>
          <span className="text-muted-foreground text-[10px] tabular-nums">
            {formatValue(max)}
          </span>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  row,
  min,
  range,
  color,
  onHover,
}: {
  row: { year: string; cells: Cell[] };
  min: number;
  range: number;
  color: string;
  onHover: (cell: Cell | null) => void;
}) {
  return (
    <>
      <span className="text-muted-foreground flex items-center text-[10px] font-medium tabular-nums">
        {row.year}
      </span>
      {row.cells.map((cell) => {
        const has = cell.value != null;
        const norm = has ? (cell.value! - min) / range : 0;
        return (
          <button
            key={cell.time}
            type="button"
            aria-label={`${cell.time}`}
            onMouseEnter={() => has && onHover(cell)}
            onMouseLeave={() => onHover(null)}
            onClick={() => has && onHover(cell)}
            className="aspect-square w-full rounded-[3px]"
            style={{
              background: has ? color : "var(--color-muted)",
              opacity: has ? 0.15 + norm * 0.85 : 0.5,
              cursor: has ? "pointer" : "default",
            }}
          />
        );
      })}
    </>
  );
}
