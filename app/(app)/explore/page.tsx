"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/shell/app-header";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/charts/states";
import type { CatalogSearchResult } from "@/lib/eurostat/catalog";
import { ALL_METRICS } from "@/lib/eurostat/registry";
import { cn } from "@/lib/utils";

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const FEATURED = ALL_METRICS.slice(0, 6);

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

        {/* quick featured */}
        {!q && !theme && (
          <section className="mt-6">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              Featured indicators
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {FEATURED.map((m) => (
                <Link
                  key={m.id}
                  href={`/dataset/${m.datasetCode}`}
                  className="border-border bg-card hover:border-primary/40 rounded-2xl border p-3.5 transition-colors active:scale-[0.99]"
                >
                  <Icon name="Activity" className="text-primary mb-2 size-4" />
                  <p className="text-sm font-semibold leading-tight">
                    {m.title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 font-mono text-[10px] uppercase">
                    {m.datasetCode}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* theme filters */}
        {themes.length > 0 && (
          <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5">
            <ThemeChip
              active={theme === null}
              onClick={() => setTheme(null)}
              label="All"
            />
            {themes.slice(0, 12).map((t) => (
              <ThemeChip
                key={t.name}
                active={theme === t.name}
                onClick={() => setTheme(t.name)}
                label={t.name}
                count={t.count}
              />
            ))}
          </div>
        )}

        {/* results */}
        <section className="mt-5 space-y-2.5 pb-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full" />
            ))
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
              <p className="text-muted-foreground px-1 text-xs">
                {data.total.toLocaleString()} datasets
                {theme ? ` in ${theme}` : ""}
                {data.total > data.results.length
                  ? ` · showing top ${data.results.length}`
                  : ""}
              </p>
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ThemeChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {label}
      {count != null && <span className="ml-1 opacity-60">{count}</span>}
    </button>
  );
}
