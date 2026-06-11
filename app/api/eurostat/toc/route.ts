import { NextResponse } from "next/server";
import { parseToc, searchCatalog } from "@/lib/eurostat/catalog";
import {
  describeError,
  fetchUpstream,
  isTimeoutError,
} from "@/lib/eurostat/upstream";

const TOC_URL =
  "https://ec.europa.eu/eurostat/api/dissemination/catalogue/toc/txt?lang=EN";

// The upstream TOC is larger than Next's data-cache item limit, so the fetch
// stays uncached and the route response carries the shared-cache policy.
const CATALOG_S_MAXAGE = 86400;

// Downloading and parsing the multi-MB TOC dominates this route, so give it
// headroom and keep the parsed catalogue around for the instance's lifetime.
export const maxDuration = 60;

const CATALOG_TTL_MS = 6 * 60 * 60 * 1000;
let catalogCache: { at: number; all: ReturnType<typeof parseToc> } | null =
  null;

async function loadCatalog() {
  if (catalogCache && Date.now() - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.all;
  }
  const res = await fetchUpstream(TOC_URL, { timeoutMs: 25_000, attempts: 2 });
  if (!res.ok) {
    throw Object.assign(new Error(`Catalogue unavailable (${res.status})`), {
      status: res.status,
    });
  }
  const all = parseToc(await res.text());
  catalogCache = { at: Date.now(), all };
  return all;
}

/**
 * Search the Eurostat catalogue.
 * Usage: /api/eurostat/toc?q=unemployment&theme=Economy%20and%20finance&limit=40
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const theme = searchParams.get("theme") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit")) || 60, 120);

  try {
    const all = await loadCatalog();
    const data = searchCatalog(all, { q, theme, limit });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          `public, max-age=0, s-maxage=${CATALOG_S_MAXAGE}, stale-while-revalidate=604800`,
      },
    });
  } catch (err) {
    console.error(`eurostat/toc fetch failed: ${describeError(err)}`);
    const upstreamStatus = (err as { status?: number }).status;
    return NextResponse.json(
      {
        error: upstreamStatus
          ? `Catalogue unavailable (${upstreamStatus})`
          : "Failed to reach Eurostat catalogue.",
      },
      { status: !upstreamStatus && isTimeoutError(err) ? 504 : 502 },
    );
  }
}
