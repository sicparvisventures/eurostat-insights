"use client";

import { useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/shell/app-header";
import { CountryChips } from "@/components/country-chips";
import { StatCard } from "@/components/charts/stat-card";
import { MetricPanel } from "@/components/dashboard/metric-panel";
import { MetricCompare } from "@/components/dashboard/metric-compare";
import { Card } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { Icon } from "@/components/ui/icon";
import { TOPIC_BY_SLUG } from "@/lib/eurostat/registry";
import { usePersonalization } from "@/lib/store/personalization";
import { cn } from "@/lib/utils";

const RANGES = [
  { value: "8", label: "Recent" },
  { value: "16", label: "Trend" },
  { value: "30", label: "Long" },
];

export function TopicDashboard({ slug }: { slug: string }) {
  const topic = TOPIC_BY_SLUG.get(slug);
  const { country, setCountry } = usePersonalization();
  const [periods, setPeriods] = useState("16");
  const [compareMetricId, setCompareMetricId] = useState(
    topic?.metrics[0]?.id ?? "",
  );

  if (!topic) notFound();

  const compareMetric =
    topic.metrics.find((m) => m.id === compareMetricId) ?? topic.metrics[0];

  return (
    <div>
      <AppHeader title={topic.title} subtitle={topic.tagline} back />

      {/* hero band */}
      <div
        className="relative mx-5 mb-5 min-h-52 overflow-hidden rounded-2xl p-5 text-white"
      >
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

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3">
          {topic.metrics.map((m) => (
            <StatCard
              key={m.id}
              metric={m}
              country={country}
              color={topic.accent}
            />
          ))}
        </div>

        {/* Compare across Europe */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Icon name="Map" className="text-primary size-4" />
            <h2 className="font-semibold tracking-tight">Compare across Europe</h2>
          </div>
          <div className="no-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5">
            {topic.metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => setCompareMetricId(m.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  m.id === compareMetric.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {m.short}
              </button>
            ))}
          </div>
          <Card className="p-5">
            <MetricCompare
              metric={compareMetric}
              selected={country}
              onSelectCountry={setCountry}
            />
          </Card>
        </section>

        {/* Trends over time */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="LineChart" className="text-primary size-4" />
              <h2 className="font-semibold tracking-tight">Trends over time</h2>
            </div>
            <Segmented
              options={RANGES}
              value={periods}
              onChange={setPeriods}
            />
          </div>
          <div className="space-y-4">
            {topic.metrics.map((m) => (
              <MetricPanel
                key={m.id}
                metric={m}
                country={country}
                periods={Number(periods)}
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
