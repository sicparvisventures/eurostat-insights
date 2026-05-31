import { parseJsonStat, type Dataset, type JsonStatRaw } from "./jsonstat";

export interface FetchParams {
  dataset: string;
  /** Fixed dimension filters (e.g. { sex: "T", age: "TOTAL" }). */
  filters?: Record<string, string | undefined>;
  /** One or more geo codes. Omit to return all geographies. */
  geo?: string | string[];
  /** Specific time period (e.g. "2023" or "2024-01"). */
  time?: string;
  /** Return only the last N time periods. */
  lastTimePeriod?: number;
}

export function buildDataUrl(params: FetchParams): string {
  const sp = new URLSearchParams();
  sp.set("dataset", params.dataset);

  if (params.filters) {
    for (const [k, v] of Object.entries(params.filters)) {
      if (v != null) sp.append(k, v);
    }
  }
  if (params.geo) {
    const geos = Array.isArray(params.geo) ? params.geo : [params.geo];
    for (const g of geos) sp.append("geo", g);
  }
  if (params.time) sp.set("time", params.time);
  if (params.lastTimePeriod) {
    sp.set("lastTimePeriod", String(params.lastTimePeriod));
  }
  return `/api/eurostat/data?${sp.toString()}`;
}

export async function fetchDataset(
  params: FetchParams,
  signal?: AbortSignal,
): Promise<Dataset> {
  const res = await fetch(buildDataUrl(params), { signal });
  const json = (await res.json()) as JsonStatRaw;
  if (!res.ok || json.error) {
    throw new Error(json.error ?? `Request failed (${res.status})`);
  }
  return parseJsonStat(json);
}

/** Stable React Query key for a dataset request. */
export function datasetQueryKey(params: FetchParams) {
  return ["eurostat", buildDataUrl(params)] as const;
}
