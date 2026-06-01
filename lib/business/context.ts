"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDataset } from "@/lib/eurostat/client";
import { timeSeries } from "@/lib/eurostat/jsonstat";
import type { WeatherInput } from "./forecast";

export interface WeatherDay extends WeatherInput {
  date: string;
  code: number;
}

export interface WeatherResponse {
  city: string;
  country: string;
  lat: number;
  lon: number;
  today: WeatherDay | null;
  days: WeatherDay[];
}

/** Live weather for a city via the Open-Meteo proxy route. */
export function useWeather(city: string, country: string) {
  return useQuery({
    queryKey: ["weather", city, country],
    queryFn: async (): Promise<WeatherResponse> => {
      const res = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
      );
      if (!res.ok) throw new Error("weather");
      return res.json();
    },
    enabled: Boolean(city),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}

export interface BusinessContext {
  cateringInflation: number | null; // % y/y
  seasonIndex: number; // 1 = average month
  seasonLabel: string;
  isLoading: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Real Eurostat context for a country: restaurant/catering price inflation
 * (HICP CP111) and a tourism season index derived from the monthly hotel-nights
 * pattern (current calendar month vs its own 3-year average).
 */
export function useBusinessContext(country: string): BusinessContext {
  const inflation = useQuery({
    queryKey: ["ctx-inflation", country],
    queryFn: () =>
      fetchDataset({
        dataset: "prc_hicp_manr",
        filters: { coicop: "CP111" },
        geo: country,
        lastTimePeriod: 14,
      }),
    staleTime: 6 * 60 * 60 * 1000,
  });

  const season = useQuery({
    queryKey: ["ctx-season", country],
    queryFn: () =>
      fetchDataset({
        dataset: "tour_occ_nim",
        filters: { freq: "M", c_resid: "TOTAL", unit: "NR", nace_r2: "I551" },
        geo: country,
        lastTimePeriod: 40,
      }),
    staleTime: 6 * 60 * 60 * 1000,
  });

  const cateringInflation = useMemo(() => {
    if (!inflation.data) return null;
    return timeSeries(inflation.data).at(-1)?.value ?? null;
  }, [inflation.data]);

  const { seasonIndex, seasonLabel } = useMemo(() => {
    if (!season.data) return { seasonIndex: 1, seasonLabel: "—" };
    const series = timeSeries(season.data);
    if (!series.length) return { seasonIndex: 1, seasonLabel: "—" };
    const byMonth = new Map<number, number[]>();
    for (const p of series) {
      const m = Number(p.time.slice(5, 7));
      if (!m) continue;
      if (!byMonth.has(m)) byMonth.set(m, []);
      byMonth.get(m)!.push(p.value);
    }
    const overall =
      series.reduce((a, p) => a + p.value, 0) / series.length || 1;
    const month = new Date().getMonth() + 1;
    const vals = byMonth.get(month);
    const monthMean = vals?.length
      ? vals.reduce((a, v) => a + v, 0) / vals.length
      : overall;
    const idx = Math.min(1.8, Math.max(0.55, monthMean / overall));
    const label =
      idx >= 1.15
        ? `Peak season · ${MONTH_NAMES[month - 1]}`
        : idx <= 0.85
          ? `Quiet season · ${MONTH_NAMES[month - 1]}`
          : `Average season · ${MONTH_NAMES[month - 1]}`;
    return { seasonIndex: Math.round(idx * 100) / 100, seasonLabel: label };
  }, [season.data]);

  return {
    cateringInflation,
    seasonIndex,
    seasonLabel,
    isLoading: inflation.isLoading || season.isLoading,
  };
}
