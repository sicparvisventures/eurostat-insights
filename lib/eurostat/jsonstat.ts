/**
 * Minimal JSON-stat 2.0 parser + slicing utilities for Eurostat responses.
 * https://json-stat.org/format/
 */

export interface JsonStatRaw {
  class?: string;
  label?: string;
  source?: string;
  updated?: string;
  value: Record<string, number | null> | (number | null)[];
  status?: Record<string, string>;
  id: string[];
  size: number[];
  dimension: Record<
    string,
    {
      label?: string;
      category: {
        index: Record<string, number> | string[];
        label?: Record<string, string>;
        unit?: Record<string, unknown>;
      };
    }
  >;
  error?: string;
}

export interface Category {
  code: string;
  label: string;
}

export interface Dimension {
  id: string;
  label: string;
  categories: Category[]; // ordered by index position
}

export interface Dataset {
  label: string;
  source: string;
  updated: string | null;
  dimIds: string[];
  size: number[];
  dims: Record<string, Dimension>;
  /** Look up a value by an array of category positions (in `dimIds` order). */
  getValue(positions: number[]): number | null;
}

export interface DataPoint {
  code: string;
  label: string;
  value: number | null;
}

/** Build ordered categories from a JSON-stat category index. */
function buildCategories(dim: JsonStatRaw["dimension"][string]): Category[] {
  const { index, label } = dim.category;
  const positions: { code: string; pos: number }[] = [];

  if (Array.isArray(index)) {
    index.forEach((code, pos) => positions.push({ code, pos }));
  } else {
    for (const [code, pos] of Object.entries(index)) {
      positions.push({ code, pos });
    }
  }
  positions.sort((a, b) => a.pos - b.pos);
  return positions.map(({ code }) => ({
    code,
    label: label?.[code] ?? code,
  }));
}

export function parseJsonStat(raw: JsonStatRaw): Dataset {
  const dimIds = raw.id ?? [];
  const size = raw.size ?? [];
  const dims: Record<string, Dimension> = {};

  for (const id of dimIds) {
    const d = raw.dimension[id];
    dims[id] = {
      id,
      label: d?.label ?? id,
      categories: d ? buildCategories(d) : [],
    };
  }

  const value = raw.value;
  const isArray = Array.isArray(value);

  function getValue(positions: number[]): number | null {
    let flat = 0;
    for (let i = 0; i < size.length; i++) {
      flat = flat * size[i] + (positions[i] ?? 0);
    }
    const v = isArray
      ? (value as (number | null)[])[flat]
      : (value as Record<string, number | null>)[String(flat)];
    return v === undefined ? null : v;
  }

  return {
    label: raw.label ?? "",
    source: raw.source ?? "Eurostat",
    updated: raw.updated ?? null,
    dimIds,
    size,
    dims,
    getValue,
  };
}

/**
 * Slice a dataset along one varying dimension while fixing the others.
 * Dimensions not present in `fixed` default to their first category.
 */
export function slice(
  ds: Dataset,
  varyDimId: string,
  fixed: Record<string, string> = {},
): DataPoint[] {
  const varyDim = ds.dims[varyDimId];
  if (!varyDim) return [];
  const varyIndex = ds.dimIds.indexOf(varyDimId);

  const basePositions = ds.dimIds.map((id) => {
    if (id === varyDimId) return 0;
    const code = fixed[id];
    if (code != null) {
      const p = ds.dims[id].categories.findIndex((c) => c.code === code);
      return p >= 0 ? p : 0;
    }
    return 0;
  });

  return varyDim.categories.map((cat, i) => {
    const pos = basePositions.slice();
    pos[varyIndex] = i;
    return { code: cat.code, label: cat.label, value: ds.getValue(pos) };
  });
}

/** Time series (varying the `time` dimension), oldest → newest, nulls dropped. */
export function timeSeries(
  ds: Dataset,
  fixed: Record<string, string> = {},
): { time: string; value: number }[] {
  return slice(ds, "time", fixed)
    .filter((p): p is DataPoint & { value: number } => p.value !== null)
    .map((p) => ({ time: p.code, value: p.value }));
}

/** The single most recent non-null value, with its time label. */
export function latestValue(
  ds: Dataset,
  fixed: Record<string, string> = {},
): { time: string; value: number } | null {
  const series = timeSeries(ds, fixed);
  return series.length ? series[series.length - 1] : null;
}

/** The unit label of a dataset's `unit` dimension (first category), if present. */
export function unitLabel(ds: Dataset): string | null {
  const unit = ds.dims["unit"];
  return unit?.categories[0]?.label ?? null;
}

export interface GeoLatest {
  value: number;
  time: string;
  label: string;
}

/**
 * The latest non-null value per geography, picked across all fetched periods.
 * Monthly/annual Eurostat series often lag unevenly per country, so we take the
 * most recent point that actually has a value for each one.
 */
export function latestByGeo(
  ds: Dataset,
  fixed: Record<string, string> = {},
): Map<string, GeoLatest> {
  const out = new Map<string, GeoLatest>();
  for (const g of ds.dims["geo"]?.categories ?? []) {
    const last = timeSeries(ds, { ...fixed, geo: g.code }).at(-1);
    if (last) out.set(g.code, { ...last, label: g.label });
  }
  return out;
}
