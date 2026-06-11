import { NextResponse } from "next/server";
import {
  describeError,
  fetchUpstream,
  isTimeoutError,
} from "@/lib/eurostat/upstream";

const BASE =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";

// Cache upstream responses for an hour; serve stale for a day.
export const revalidate = 3600;

// Leave room for the retry/backoff schedule in fetchUpstream.
export const maxDuration = 60;

/**
 * Thin caching proxy to the Eurostat dissemination API.
 * Usage: /api/eurostat/data?dataset=demo_pjan&geo=BE&sex=T&lastTimePeriod=10
 * Every query param except `dataset` is forwarded as a dimension filter.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataset = searchParams.get("dataset");

  if (!dataset || !/^[a-z0-9_]+$/i.test(dataset)) {
    return NextResponse.json(
      { error: "Missing or invalid `dataset` parameter." },
      { status: 400 },
    );
  }

  const upstream = new URLSearchParams();
  upstream.set("format", "JSON");
  upstream.set("lang", "EN");
  for (const [key, value] of searchParams) {
    if (key === "dataset") continue;
    upstream.append(key, value);
  }

  const url = `${BASE}/${encodeURIComponent(dataset)}?${upstream.toString()}`;

  try {
    const res = await fetchUpstream(url, {
      revalidate,
      accept: "application/json",
    });

    if (!res.ok) {
      let detail = `Eurostat returned ${res.status}`;
      try {
        const body = await res.json();
        const upstreamError = Array.isArray(body?.error)
          ? body.error[0]?.label
          : body?.error;
        if (typeof upstreamError === "string") detail = upstreamError;
      } catch {
        // Keep the status-based fallback if Eurostat does not return JSON.
      }
      console.error(`eurostat/data upstream ${res.status} for ${url}`);
      return NextResponse.json(
        { error: detail },
        { status: res.status === 404 ? 404 : 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error(`eurostat/data fetch failed for ${url}: ${describeError(err)}`);
    return NextResponse.json(
      { error: "Failed to reach Eurostat." },
      { status: isTimeoutError(err) ? 504 : 502 },
    );
  }
}
