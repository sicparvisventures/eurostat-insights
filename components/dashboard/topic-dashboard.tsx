"use client";

import { useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/shell/app-header";
import { CountryChips } from "@/components/country-chips";
import { StatCard } from "@/components/charts/stat-card";
import { MetricPanel } from "@/components/dashboard/metric-panel";
import { MetricCompare } from "@/components/dashboard/metric-compare";
import { CountryCompare } from "@/components/dashboard/country-compare";
import { RankingHeatmap } from "@/components/dashboard/ranking-heatmap";
import { SeasonalityPanel } from "@/components/dashboard/seasonality-panel";
import { Card } from "@/components/ui/card";
import { ChipBar } from "@/components/ui/chip-bar";
import { Segmented } from "@/components/ui/segmented";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Icon } from "@/components/ui/icon";
import { TOPIC_BY_SLUG } from "@/lib/eurostat/registry";
import { usePersonalization } from "@/lib/store/personalization";
import { DEFAULT_DATA_RANGE, type DataRange } from "@/lib/date-range";

type DeepDiveView = "europe" | "compare" | "seasonality" | "ranking";

export function TopicDashboard({ slug }: { slug: string }) {
  const topic = TOPIC_BY_SLUG.get(slug);
  const { country, setCountry } = usePersonalization();
  const [range, setRange] = useState<DataRange>(DEFAULT_DATA_RANGE);
  const [compareMetricId, setCompareMetricId] = useState(
    topic?.metrics[0]?.id ?? "",
  );
  const [view, setView] = useState<DeepDiveView>("europe");

  if (!topic) notFound();

  const compareMetric =
    topic.metrics.find((m) => m.id === compareMetricId) ?? topic.metrics[0];
  const monthlyMetrics = topic.metrics.filter((m) => m.frequency === "M");

  const views: { value: DeepDiveView; label: string }[] = [
    { value: "europe", label: "Europe" },
    { value: "compare", label: "Countries" },
    ...(monthlyMetrics.length
      ? [{ value: "seasonality" as const, label: "Seasonality" }]
      : []),
    { value: "ranking", label: "Ranking" },
  ];
  const activeView = views.some((v) => v.value === view) ? view : "europe";

  return (
    <div>
      <AppHeader title={topic.title} subtitle={topic.tagline} back />

      {/* hero band */}
      <div className="relative mx-5 mb-5 min-h-52 overflow-hidden rounded-2xl p-5 text-white">
        <Image
          src={topic.image}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div
          className="absolute inset-0 opacity-35"
          style={{ background: topic.accent }}
        />
        <div className="relative flex h-full min-h-40 flex-col justify-between">
          <div className="mb-12 flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Icon name={topic.icon} className="size-5" />
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/90">
            {topic.description}
          </p>
        </div>
      </div>

      <div className="space-y-7 px-5">
        <CountryChips value={country} onChange={setCountry} />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Analysis window</p>
            <p className="text-muted-foreground text-xs">
              Applies to trends, comparisons and seasonality.
            </p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {topic.metrics.map((m) => (
            <StatCard
              key={m.id}
              metric={m}
              country={country}
              color={topic.accent}
              range={range}
            />
          ))}
        </div>

        {/* Deep dive — lazy-mounted modules */}
        <section>
          <h2 className="mb-3 font-semibold tracking-tight">Deep dive</h2>
          <div className="no-scrollbar -mx-5 mb-4 overflow-x-auto px-5">
            <Segmented options={views} value={activeView} onChange={setView} />
          </div>

          <Card className="p-5">
            {activeView === "europe" && (
              <div className="space-y-4">
                <ChipBar
                  options={topic.metrics.map((m) => ({
                    value: m.id,
                    label: m.short,
                  }))}
                  value={compareMetric.id}
                  onChange={setCompareMetricId}
                  ariaLabel="Metric to compare"
                />
                <MetricCompare
                  metric={compareMetric}
                  selected={country}
                  onSelectCountry={setCountry}
                  range={range}
                />
              </div>
            )}

            {activeView === "compare" && (
              <CountryCompare
                metrics={topic.metrics}
                selected={country}
                range={range}
              />
            )}

            {activeView === "seasonality" && monthlyMetrics.length > 0 && (
              <SeasonalityPanel
                metrics={monthlyMetrics}
                country={country}
                range={range}
                color={topic.accent}
              />
            )}

            {activeView === "ranking" && (
              <RankingHeatmap
                metrics={topic.metrics}
                selected={country}
                onSelectCountry={setCountry}
                range={range}
                color={topic.accent}
              />
            )}
          </Card>
        </section>

        {/* Trends over time */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Trends over time</h2>
            <DateRangePicker value={range} onChange={setRange} />
          </div>
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {topic.metrics.map((m) => (
              <MetricPanel
                key={m.id}
                metric={m}
                country={country}
                range={range}
                color={topic.accent}
              />
            ))}
          </div>
        </section>

        <p className="text-muted-foreground/60 pb-2 text-center text-xs">
          Source: Eurostat · {topic.title}
        </p>
      </div>
    </div>
  );
}
