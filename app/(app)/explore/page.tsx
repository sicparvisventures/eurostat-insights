"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/shell/app-header";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/charts/states";
import { ChipBar } from "@/components/ui/chip-bar";
import type { CatalogSearchResult } from "@/lib/eurostat/catalog";
import { ALL_METRICS } from "@/lib/eurostat/registry";

/** Sentinel chip value for the "no theme filter" option. */
const ALL_THEMES = "__all__";

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const FEATURED = ALL_METRICS.slice(0, 6);

/** One-tap searches that fill the box — keeps the empty state useful. */
const POPULAR = [
  "tourism",
  "unemployment",
  "inflation",
  "GDP",
  "population",
  "internet",
  "emissions",
  "wages",
];

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const debouncedQ = useDebounced(q);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["toc", debouncedQ, theme],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (debouncedQ) sp.set("q", debouncedQ);
      if (theme) sp.set("theme", theme);
      const res = await fetch(`/api/eurostat/toc?${sp.toString()}`);
      if (!res.ok) throw new Error("Failed to load catalogue");
      return (await res.json()) as CatalogSearchResult;
    },
  });

  const themes = data?.themes ?? [];

  return (
    <div>
      <AppHeader title="Explore" subtitle="The full Eurostat catalogue" />

      <div className="px-5 pt-2">
        {/* search */}
        <div className="bg-card border-border focus-within:border-primary focus-within:ring-primary/20 flex items-center gap-2 rounded-2xl border px-4 py-3 transition-colors focus-within:ring-4">
          <Icon name="Search" className="text-muted-foreground size-5" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search datasets — e.g. unemployment, CO₂, tourism"
            className="flex-1 bg-transparent text-base outline-none"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear">
              <Icon name="X" className="text-muted-foreground size-4" />
            </button>
          )}
        </div>

        {/* empty state: popular searches + compact featured */}
        {!q && !theme && (
          <div className="mt-6 space-y-6">
            <section>
              <p className="text-muted-foreground mb-2.5 text-xs font-medium">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQ(term)}
                    className="border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium capitalize transition-colors active:scale-95"
                  >
                    <Icon name="Search" className="size-3.5 opacity-60" />
                    {term}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-muted-foreground mb-2.5 text-xs font-medium">
                Featured datasets
              </p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                {FEATURED.map((m) => (
                  <Link
                    key={m.id}
                    href={`/dataset/${m.datasetCode}`}
                    className="border-border bg-card hover:border-primary/40 group rounded-xl border p-3 transition-colors active:scale-[0.99]"
                  >
                    <p className="truncate text-[13px] font-semibold leading-tight">
                      {m.short}
                    </p>
                    <p className="text-muted-foreground mt-1 line-clamp-1 text-[11px] leading-snug">
                      {m.title}
                    </p>
                    <p className="text-muted-foreground/60 mt-1 font-mono text-[10px] uppercase">
                      {m.datasetCode}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* theme filters */}
        {themes.length > 0 && (
          <div className="mt-6">
            <ChipBar
              ariaLabel="Filter by theme"
              value={theme ?? ALL_THEMES}
              onChange={(v) => setTheme(v === ALL_THEMES ? null : v)}
              options={[
                { value: ALL_THEMES, label: "All themes" },
                ...themes.slice(0, 12).map((t) => ({
                  value: t.name,
                  label: (
                    <>
                      {t.name}
                      <span className="ml-1.5 opacity-60">{t.count}</span>
                    </>
                  ),
                })),
              ]}
            />
          </div>
        )}

        {/* results */}
        <section className="mt-5 pb-4">
          {isLoading ? (
            <div className="grid gap-2.5 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !data?.results.length ? (
            <EmptyState
              icon="Search"
              title="No datasets found"
              message="Try a different search term or theme."
            />
          ) : (
            <>
              <p className="text-muted-foreground mb-2.5 px-1 text-xs">
                {data.total.toLocaleString()} datasets
                {theme ? ` in ${theme}` : ""}
                {data.total > data.results.length
                  ? ` · showing top ${data.results.length}`
                  : ""}
              </p>
              <div className="grid gap-2.5 lg:grid-cols-2">
                {data.results.map((d) => (
                <Link key={d.code} href={`/dataset/${d.code}`}>
                  <Card className="hover:border-primary/40 flex items-center gap-3 p-3.5 transition-colors active:scale-[0.99]">
                    <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <Icon name="Database" className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-tight">
                        {d.title}
                      </p>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        <span className="font-mono uppercase">{d.code}</span>
                        {d.dataStart && d.dataEnd
                          ? ` · ${d.dataStart}–${d.dataEnd}`
                          : ""}
                      </p>
                    </div>
                    <Icon
                      name="ChevronRight"
                      className="text-muted-foreground size-4 shrink-0"
                    />
                  </Card>
                </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
