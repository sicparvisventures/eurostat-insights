import { NextResponse } from "next/server";
import { parseToc, searchCatalog } from "@/lib/eurostat/catalog";

const TOC_URL =
  "https://ec.europa.eu/eurostat/api/dissemination/catalogue/toc/txt?lang=EN";

// The upstream TOC is larger than Next's data-cache item limit, so the fetch
// stays uncached and the route response carries the shared-cache policy.
const CATALOG_S_MAXAGE = 86400;

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
    const res = await fetch(TOC_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Catalogue unavailable (${res.status})` },
        { status: 502 },
      );
    }
    const text = await res.text();
    const all = parseToc(text);
    const data = searchCatalog(all, { q, theme, limit });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          `public, max-age=0, s-maxage=${CATALOG_S_MAXAGE}, stale-while-revalidate=604800`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Eurostat catalogue." },
      { status: 504 },
    );
  }
}
