"use client";

import { useQuery } from "@tanstack/react-query";
import {
  datasetQueryKey,
  fetchDataset,
  type FetchParams,
} from "@/lib/eurostat/client";
import type { Metric } from "@/lib/eurostat/registry";
import {
  DEFAULT_DATA_RANGE,
  rangeToFetchParams,
  type DataRange,
} from "@/lib/date-range";

/** Generic dataset query. */
export function useDataset(params: FetchParams, enabled = true) {
  return useQuery({
    queryKey: datasetQueryKey(params),
    queryFn: ({ signal }) => fetchDataset(params, signal),
    enabled: enabled && Boolean(params.dataset),
  });
}

/** Time series of a metric for a single country (last N periods). */
export function useMetricSeries(
  metric: Metric,
  geo: string,
  range: DataRange | number = DEFAULT_DATA_RANGE,
) {
  const timeParams =
    typeof range === "number"
      ? { lastTimePeriod: range }
      : rangeToFetchParams(range, metric.frequency);

  return useDataset({
    dataset: metric.datasetCode,
    filters: metric.filters,
    geo,
    ...timeParams,
  });
}

/**
 * Recent values of a metric across all countries (for comparison + map).
 * Fetches several periods so we can pick the latest *non-null* value per
 * country — monthly tourism series often lag by a month or two.
 */
export function useMetricByCountry(
  metric: Metric,
  range: DataRange | number = 8,
) {
  const timeParams =
    typeof range === "number"
      ? { lastTimePeriod: range }
      : rangeToFetchParams(range, metric.frequency);

  return useDataset({
    dataset: metric.datasetCode,
    filters: metric.filters,
    ...timeParams,
  });
}
