"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/shell/app-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { CountryChips } from "@/components/country-chips";
import { StatCard } from "@/components/charts/stat-card";
import { MetricPanel } from "@/components/dashboard/metric-panel";
import { Icon } from "@/components/ui/icon";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  TOPIC_BY_SLUG,
  ALL_METRICS,
  findMetric,
} from "@/lib/eurostat/registry";
import { usePersonalization } from "@/lib/store/personalization";
import { countryName } from "@/lib/eurostat/constants";
import { DEFAULT_DATA_RANGE, type DataRange } from "@/lib/date-range";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Deterministic "indicator of the day" so it stays stable across a session. */
function spotlightMetric() {
  const day = Math.floor(Date.now() / 86_400_000);
  return ALL_METRICS[day % ALL_METRICS.length];
}

export default function HomePage() {
  const { name, interests, country, setCountry, favorites } =
    usePersonalization();
  const [range, setRange] = useState<DataRange>(DEFAULT_DATA_RANGE);
  const spotlight = spotlightMetric();
  const spotlightAccent =
    TOPIC_BY_SLUG.get(spotlight.topicSlug)?.accent ?? "var(--color-chart-1)";
  const activeTopics = interests
    .map((slug) => TOPIC_BY_SLUG.get(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <AppHeader
        title={`${greeting()}${name ? `, ${name}` : ""}`}
        subtitle={today}
        action={<ThemeToggle />}
      />

      <div className="space-y-7 px-5 pt-2">
        <CountryChips value={country} onChange={setCountry} />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Data range</p>
            <p className="text-muted-foreground text-xs">
              Controls the visible trend cards.
            </p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        {/* Spotlight */}
        <section>
          <SectionHeader
            icon="Sparkles"
            title="Indicator of the day"
            href={`/topics/${spotlight.topicSlug}`}
          />
          <MetricPanel
            metric={spotlight}
            country={country}
            color={spotlightAccent}
            range={range}
          />
        </section>

        {/* Favorites */}
        {favorites.length > 0 && (
          <section>
            <SectionHeader icon="Star" title="Your favourites" />
            <div className="grid grid-cols-2 gap-3">
              {favorites
                .map(findMetric)
                .filter((m): m is NonNullable<typeof m> => Boolean(m))
                .map((m) => (
                  <StatCard
                    key={m.id}
                    metric={m}
                    country={country}
                    href={`/dataset/${m.datasetCode}`}
                    color={
                      TOPIC_BY_SLUG.get(m.topicSlug)?.accent ??
                      "var(--color-chart-1)"
                    }
                    range={range}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Personalised topic rows */}
        {activeTopics.map((topic) => (
          <section key={topic.slug}>
            <SectionHeader
              icon={topic.icon}
              title={topic.title}
              href={`/topics/${topic.slug}`}
            />
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
              {topic.metrics.map((m) => (
                <StatCard
                  key={m.id}
                  metric={m}
                  country={country}
                  href={`/dataset/${m.datasetCode}`}
                  className="w-56 shrink-0"
                  color={topic.accent}
                  range={range}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Explore CTA */}
        <Link
          href="/explore"
          className="border-border bg-card hover:border-foreground/20 flex items-center gap-4 rounded-2xl border p-5 transition-colors active:scale-[0.995]"
        >
          <div className="bg-muted text-foreground flex size-11 items-center justify-center rounded-xl">
            <Icon name="Compass" className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Explore all of Eurostat</p>
            <p className="text-muted-foreground text-sm">
              Search thousands of official datasets
            </p>
          </div>
          <Icon name="ChevronRight" className="text-muted-foreground size-5" />
        </Link>

        <p className="text-muted-foreground/60 pb-2 text-center text-xs">
          Focused on {countryName(country)} · Source: Eurostat
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  href,
}: {
  icon: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="text-primary size-4" />
        <h2 className="font-semibold tracking-tight">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium"
        >
          View all <Icon name="ChevronRight" className="size-4" />
        </Link>
      )}
    </div>
  );
}
