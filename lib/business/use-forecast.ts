"use client";

import { useMemo } from "react";
import {
  computeForecast,
  computeGroupForecast,
  simulatedEventUplift,
  type ForecastModifiers,
} from "./forecast";
import { useWeather, useBusinessContext } from "./context";
import type { LocationConfig } from "@/lib/store/business";

/**
 * Full forecast for one location: config + live weather + Eurostat season +
 * simulated event uplift. `override` lets the Forecast page run what-if scenarios.
 */
export function useLocationForecast(
  loc: LocationConfig | null,
  override: Partial<ForecastModifiers> = {},
) {
  const weather = useWeather(loc?.city ?? "", loc?.country ?? "");
  const ctx = useBusinessContext(loc?.country ?? "BE");

  const overrideKey = JSON.stringify(override);
  const forecast = useMemo(() => {
    if (!loc) return null;
    const date = new Date();
    return computeForecast(loc, {
      weather: weather.data?.today ?? null,
      seasonIndex: ctx.seasonIndex,
      eventUplift: simulatedEventUplift(loc, date),
      date,
      ...override,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc, weather.data, ctx.seasonIndex, overrideKey]);

  return { forecast, weather, ctx };
}

/**
 * Group/district roll-up. Computed synchronously (season + events, no per-site
 * weather) so it is safe regardless of how many locations exist.
 */
export function useGroupForecast(
  locations: LocationConfig[],
  seasonIndex: number,
) {
  return useMemo(() => {
    const date = new Date();
    const rows = locations.map((location) => ({
      location,
      forecast: computeForecast(location, {
        seasonIndex,
        eventUplift: simulatedEventUplift(location, date),
        date,
      }),
    }));
    return computeGroupForecast(rows);
  }, [locations, seasonIndex]);
}
