"use client";

import { useMemo, useState } from "react";
import { useDataset } from "@/lib/hooks/use-eurostat";
import { slice, unitLabel, type Dataset } from "@/lib/eurostat/jsonstat";
import { AppHeader } from "@/components/shell/app-header";
import { CountryChips } from "@/components/country-chips";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { EuropeChoropleth } from "@/components/charts/europe-choropleth";
import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart";
import {
  ChartSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/charts/states";
import { EU_COUNTRY_CODES } from "@/lib/eurostat/constants";
import { usePersonalization } from "@/lib/store/personalization";

/** Heuristic value formatter based on the dataset's unit label. */
function makeFormatter(unit: string | null) {
  const u = (unit ?? "").toLowerCase();
  if (u.includes("percent") || u.includes("%") || u.includes("rate")) {
    return (v: number) => `${v.toFixed(1)}%`;
  }
  if (u.includes("euro") || u.includes("eur")) {
    return (v: number) =>
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "EUR",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(v);
  }
  if (u.includes("year")) return (v: number) => v.toFixed(1);
  return (v: number) =>
    new Intl.NumberFormat("en-GB", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(v);
}

function toCsv(rows: { time: string; value: number }[], label: string): string {
  const header = `time,${label.replace(/,/g, " ")}`;
  const body = rows.map((r) => `${r.time},${r.value}`).join("\n");
  return `${header}\n${body}`;
}

export function DatasetViewer({ code }: { code: string }) {
  const { country } = usePersonalization();
  const [geo, setGeo] = useState(country);

  // Snapshot: latest period across all geos + dim combos (structure + map data).
  const snapshot = useDataset({ dataset: code, lastTimePeriod: 1 });

  return (
    <div>
      <AppHeader
        title={snapshot.data?.label || "Dataset"}
        subtitle={code.toUpperCase()}
        back
      />
      <div className="space-y-6 px-5 pt-2">
        {snapshot.isLoading ? (
          <ChartSkeleton height={280} />
        ) : snapshot.isError ? (
          <Card className="p-5">
            <ErrorState onRetry={() => snapshot.refetch()} />
            <p className="text-muted-foreground mt-2 text-center text-xs">
              Some datasets are too large to load directly.{" "}
              <a
                className="text-primary underline"
                href={`https://ec.europa.eu/eurostat/databrowser/view/${code}/default/table`}
                target="_blank"
                rel="noreferrer"
              >
                View on Eurostat
              </a>
            </p>
          </Card>
        ) : snapshot.data ? (
          <DatasetBody
            code={code}
            snapshot={snapshot.data}
            geo={geo}
            setGeo={setGeo}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function DatasetBody({
  code,
  snapshot,
  geo,
  setGeo,
}: {
  code: string;
  snapshot: Dataset;
  geo: string;
  setGeo: (g: string) => void;
}) {
  const unit = unitLabel(snapshot);
  const fmt = useMemo(() => makeFormatter(unit), [unit]);

  // Selectable dimensions: size > 1, excluding time & geo.
  const selectableDims = snapshot.dimIds.filter(
    (id) =>
      id !== "time" &&
      id !== "geo" &&
      (snapshot.dims[id]?.categories.length ?? 0) > 1,
  );

  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      selectableDims.map((id) => [id, snapshot.dims[id].categories[0].code]),
    ),
  );

  const hasGeo = Boolean(snapshot.dims["geo"]);
  const hasTime = Boolean(snapshot.dims["time"]);

  // Series for the selected geo over time (separate, bounded fetch).
  const series = useDataset(
    {
      dataset: code,
      filters: selection,
      geo,
      lastTimePeriod: 40,
    },
    hasTime,
  );

  const seriesPoints = useMemo(() => {
    if (!series.data) return [];
    return slice(series.data, "time", selection)
      .filter((p): p is typeof p & { value: number } => p.value !== null)
      .map((p) => ({ time: p.code, value: p.value }));
  }, [series.data, selection]);

  // Country comparison from the snapshot (no extra fetch).
  const compare = useMemo(() => {
    if (!hasGeo) return { values: new Map<string, number>(), bars: [] };
    const points = slice(snapshot, "geo", selection);
    const values = new Map<string, number>();
    const bars: { code: string; label: string; value: number }[] = [];
    for (const p of points) {
      if (p.value == null || !EU_COUNTRY_CODES.has(p.code)) continue;
      values.set(p.code, p.value);
      bars.push({ code: p.code, label: p.label, value: p.value });
    }
    return { values, bars };
  }, [snapshot, selection, hasGeo]);

  const latest = seriesPoints.at(-1);

  function downloadCsv() {
    const csv = toCsv(seriesPoints, snapshot.label);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${code}_${geo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {unit && (
        <p className="text-muted-foreground -mt-2 text-sm">Unit: {unit}</p>
      )}

      {/* dimension selectors */}
      {selectableDims.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {selectableDims.map((id) => (
            <Select
              key={id}
              label={snapshot.dims[id].label}
              value={selection[id]}
              onChange={(v) => setSelection((s) => ({ ...s, [id]: v }))}
              options={snapshot.dims[id].categories.map((c) => ({
                value: c.code,
                label: c.label,
              }))}
            />
          ))}
        </div>
      )}

      {/* geo selector */}
      {hasGeo && <CountryChips value={geo} onChange={setGeo} />}

      {/* time series */}
      {hasTime && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold leading-tight">Over time</h3>
              {latest && (
                <p className="text-muted-foreground text-xs">
                  Latest: {fmt(latest.value)} ({latest.time})
                </p>
              )}
            </div>
            {seriesPoints.length > 0 && (
              <Button size="sm" variant="secondary" onClick={downloadCsv}>
                <Icon name="Download" /> CSV
              </Button>
            )}
          </div>
          {series.isLoading ? (
            <ChartSkeleton height={220} />
          ) : series.isError ? (
            <ErrorState onRetry={() => series.refetch()} />
          ) : seriesPoints.length === 0 ? (
            <EmptyState message="No time series for this selection." />
          ) : (
            <TimeSeriesChart
              series={[
                {
                  id: "v",
                  name: snapshot.label,
                  color: "var(--color-primary)",
                  data: seriesPoints,
                },
              ]}
              height={220}
              formatValue={fmt}
            />
          )}
        </Card>
      )}

      {/* compare across Europe */}
      {hasGeo && compare.values.size > 1 && (
        <Card className="p-5">
          <h3 className="mb-3 font-semibold leading-tight">
            Across Europe
          </h3>
          <EuropeChoropleth
            values={compare.values}
            selected={geo}
            onSelect={setGeo}
            formatValue={fmt}
          />
          <div className="mt-5">
            <ComparisonBarChart
              data={compare.bars}
              highlight={geo}
              formatValue={fmt}
              limit={12}
            />
          </div>
        </Card>
      )}

      {/* recent data table */}
      {seriesPoints.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-border border-b px-5 py-3">
            <h3 className="font-semibold leading-tight">Recent data</h3>
          </div>
          <div className="divide-border divide-y">
            {[...seriesPoints]
              .reverse()
              .slice(0, 10)
              .map((r) => (
                <div
                  key={r.time}
                  className="flex items-center justify-between px-5 py-2.5 text-sm"
                >
                  <span className="text-muted-foreground tabular-nums">
                    {r.time}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {fmt(r.value)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      <p className="text-muted-foreground/70 pb-2 text-center text-xs">
        Source: Eurostat ·{" "}
        <a
          className="underline"
          href={`https://ec.europa.eu/eurostat/databrowser/view/${code}/default/table`}
          target="_blank"
          rel="noreferrer"
        >
          View original
        </a>
      </p>
    </>
  );
}
