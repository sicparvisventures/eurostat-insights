import { NextResponse } from "next/server";
import { cityCoordinates } from "@/lib/business/cities";

// Open-Meteo is free and keyless. Cache an hour, serve stale for a day.
export const revalidate = 3600;

const GEOCODE = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST = "https://api.open-meteo.com/v1/forecast";

// Minimal WMO weather-code → label map.
const WMO: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Drizzle",
  53: "Drizzle",
  55: "Drizzle",
  61: "Rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Snow",
  73: "Snow",
  75: "Snow",
  80: "Showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim();
  const country = searchParams.get("country")?.trim();
  if (!city) {
    return NextResponse.json({ error: "Missing `city`." }, { status: 400 });
  }

  // Eurostat uses EL/UK; Open-Meteo expects ISO-3166 GR/GB.
  const geoCountry =
    country === "EL" ? "GR" : country === "UK" ? "GB" : country;

  try {
    const known = country ? cityCoordinates(country, city) : null;
    let place = known
      ? {
          name: city,
          country_code: geoCountry ?? country,
          latitude: known.lat,
          longitude: known.lon,
        }
      : null;

    if (!place) {
      const geoUrl = `${GEOCODE}?name=${encodeURIComponent(city)}&count=1&language=en&format=json${
        geoCountry ? `&country=${encodeURIComponent(geoCountry)}` : ""
      }`;
      const geoRes = await fetch(geoUrl, { next: { revalidate: 86400 } });
      const geo = await geoRes.json();
      place = geo?.results?.[0];
      if (!place) {
        return NextResponse.json(
          { error: `Could not locate "${city}".` },
          { status: 404 },
        );
      }
    }

    const fc = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      daily:
        "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code",
      forecast_days: "7",
      timezone: "auto",
    });
    const fcRes = await fetch(`${FORECAST}?${fc.toString()}`, {
      next: { revalidate },
    });
    if (!fcRes.ok) {
      return NextResponse.json(
        { error: "Weather service unavailable." },
        { status: 502 },
      );
    }
    const data = await fcRes.json();
    const d = data.daily;
    const days = (d?.time ?? []).map((date: string, i: number) => ({
      date,
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      precipitation: d.precipitation_sum[i],
      windSpeed: d.wind_speed_10m_max[i],
      code: d.weather_code[i],
      summary: WMO[d.weather_code[i]] ?? "—",
    }));

    return NextResponse.json(
      {
        city: place.name,
        country: place.country_code,
        lat: place.latitude,
        lon: place.longitude,
        today: days[0] ?? null,
        days,
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to reach weather service." },
      { status: 504 },
    );
  }
}
