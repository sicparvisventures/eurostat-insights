/**
 * Parser + search for the Eurostat catalogue (table of contents).
 * Server-only: parses the upstream TSV into a flat, searchable dataset list.
 */

export interface DatasetMeta {
  code: string;
  title: string;
  type: string; // "dataset" | "table" | ...
  theme: string; // top-level theme folder
  lastUpdate: string;
  dataStart: string;
  dataEnd: string;
  values: number;
}

function unquote(s: string): string {
  return s.replace(/^"([^]*)"$/, "$1");
}

function leadingSpaces(s: string): number {
  const m = s.match(/^ */);
  return m ? m[0].length : 0;
}

/**
 * Parse the TOC TSV. Each line:
 * "title" \t "code" \t "type" \t "last update" \t "last structure" \t "start" \t "end" \t "values"
 * Title indentation (4 spaces / level) encodes folder depth.
 */
export function parseToc(text: string): DatasetMeta[] {
  const lines = text.split(/\r?\n/);
  const results: DatasetMeta[] = [];
  const folderStack: string[] = []; // folder title by depth

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = line.split("\t").map(unquote);
    if (cols.length < 3) continue;

    const rawTitle = cols[0];
    const depth = Math.floor(leadingSpaces(rawTitle) / 4);
    const title = rawTitle.trim();
    const code = cols[1]?.trim();
    const type = cols[2]?.trim();

    if (type === "folder") {
      folderStack[depth] = title;
      folderStack.length = depth + 1;
      continue;
    }

    if (!code) continue;
    const theme = folderStack[1] ?? folderStack[0] ?? "Other";

    results.push({
      code,
      title,
      type,
      theme,
      lastUpdate: cols[3]?.trim() ?? "",
      dataStart: cols[5]?.trim() ?? "",
      dataEnd: cols[6]?.trim() ?? "",
      values: Number((cols[7] ?? "").replace(/\D/g, "")) || 0,
    });
  }

  return results;
}

export interface CatalogSearchResult {
  results: DatasetMeta[];
  total: number;
  themes: { name: string; count: number }[];
}

/** Filter + rank datasets by a free-text query and optional theme. */
export function searchCatalog(
  all: DatasetMeta[],
  { q, theme, limit = 60 }: { q?: string; theme?: string; limit?: number },
): CatalogSearchResult {
  const themeCounts = new Map<string, number>();
  for (const d of all) themeCounts.set(d.theme, (themeCounts.get(d.theme) ?? 0) + 1);
  const themes = [...themeCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  let filtered = all;
  if (theme) filtered = filtered.filter((d) => d.theme === theme);

  const query = q?.trim().toLowerCase();
  if (query) {
    const terms = query.split(/\s+/);
    filtered = filtered
      .map((d) => {
        const hay = `${d.title} ${d.code}`.toLowerCase();
        let score = 0;
        for (const t of terms) {
          const idx = hay.indexOf(t);
          if (idx === -1) return null;
          score += idx === 0 ? 3 : hay.includes(` ${t}`) ? 2 : 1;
          if (d.code.toLowerCase() === t) score += 5;
        }
        return { d, score };
      })
      .filter((x): x is { d: DatasetMeta; score: number } => x !== null)
      .sort((a, b) => b.score - a.score || b.d.values - a.d.values)
      .map((x) => x.d);
  } else {
    filtered = [...filtered].sort((a, b) => b.values - a.values);
  }

  // The TOC lists some datasets under multiple themes; collapse to unique codes
  // (keeping the best-ranked occurrence) so results carry stable React keys.
  const seen = new Set<string>();
  const deduped = filtered.filter((d) => {
    if (seen.has(d.code)) return false;
    seen.add(d.code);
    return true;
  });

  return { results: deduped.slice(0, limit), total: deduped.length, themes };
}
