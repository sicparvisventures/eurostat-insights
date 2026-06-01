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

function inputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

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
    const date = override.date ?? new Date();
    const weatherForDate =
      "weather" in override
        ? override.weather
        : (weather.data?.days.find((d) => d.date === inputDate(date)) ?? null);
    return computeForecast(loc, {
      weather: weatherForDate,
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
  date = new Date(),
  override: Partial<ForecastModifiers> = {},
) {
  const dateTime = date.getTime();
  const overrideKey = JSON.stringify(override);
  return useMemo(() => {
    const focusDate = new Date(dateTime);
    const rows = locations.map((location) => ({
      location,
      forecast: computeForecast(location, {
        seasonIndex,
        eventUplift: simulatedEventUplift(location, focusDate),
        date: focusDate,
        ...override,
      }),
    }));
    return computeGroupForecast(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, seasonIndex, dateTime, overrideKey]);
}
