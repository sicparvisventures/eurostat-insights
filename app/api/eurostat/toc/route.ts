import { NextResponse } from "next/server";
import { parseToc, searchCatalog } from "@/lib/eurostat/catalog";

const TOC_URL =
  "https://ec.europa.eu/eurostat/api/dissemination/catalogue/toc/txt?lang=EN";

// Catalogue changes rarely — cache for a day.
export const revalidate = 86400;

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
    const res = await fetch(TOC_URL, { next: { revalidate } });
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
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Eurostat catalogue." },
      { status: 504 },
    );
  }
}
