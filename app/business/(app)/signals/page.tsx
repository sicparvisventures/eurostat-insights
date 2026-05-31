"use client";

import { AppHeader } from "@/components/shell/app-header";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  SectionTitle,
  SignalRows,
  SourceHealthList,
} from "@/components/business/business-widgets";
import {
  BUSINESS_SIGNAL_SOURCES,
  BUSINESS_SIGNALS,
  SOURCE_HEALTH,
} from "@/lib/business/signals";
import { BUSINESS_EUROSTAT_SIGNALS } from "@/lib/business/sources/eurostat";
import { useBusinessStore } from "@/lib/store/business";

export default function BusinessSignalsPage() {
  const profile = useBusinessStore((state) => state.profile);

  return (
    <div>
      <AppHeader
        title="Signals"
        subtitle="Source explorer and provenance"
        homeHref="/business/home"
      />

      <div className="space-y-7 px-5 pt-2">
        <section>
          <SectionTitle icon="Radar" title="Live decision signals" />
          <SignalRows signals={BUSINESS_SIGNALS} />
        </section>

        <section>
          <SectionTitle icon="Database" title="Source health" />
          <SourceHealthList items={SOURCE_HEALTH} />
        </section>

        <section>
          <SectionTitle icon="Compass" title="Source inventory" />
          <div className="grid grid-cols-1 gap-3">
            {BUSINESS_SIGNAL_SOURCES.map((source) => (
              <Card key={source.id} className="p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon name={source.icon} className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{source.title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {source.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Tag>{source.access}</Tag>
                  <Tag>{source.priority}</Tag>
                  {profile.connectedSources.includes(source.id) && (
                    <Tag>enabled</Tag>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon="Euro" title="Eurostat business baseline" />
          <div className="divide-y divide-border overflow-hidden rounded-2xl border bg-card">
            {BUSINESS_EUROSTAT_SIGNALS.map((signal) => (
              <div key={signal.id} className="p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold leading-tight">{signal.title}</p>
                    <p className="text-muted-foreground font-mono text-[10px] uppercase">
                      {signal.datasetCode} · {signal.cadence}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                    {signal.businessUse}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {signal.geoLevel} baseline · freshness lag:{" "}
                  {signal.freshnessLag}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-muted rounded-full px-2 py-1 text-[11px] font-medium">
      {children}
    </span>
  );
}
