import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  demandBand,
  type BusinessSignal,
  type DaypartForecast,
  type HotspotEstimate,
  type SourceHealth,
} from "@/lib/business/signals";
import { cn } from "@/lib/utils";

export function BusinessScoreCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
}) {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <Icon name={icon} className="text-muted-foreground size-4" />
      </div>
      <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
    </Card>
  );
}

export function DaypartRows({
  forecasts,
  active,
}: {
  forecasts: DaypartForecast[];
  active?: DaypartForecast["id"];
}) {
  return (
    <div className="space-y-3">
      {forecasts.map((item) => (
        <Link
          href="/business/forecast"
          key={item.id}
          className={cn(
            "border-border bg-card block rounded-2xl border p-4 transition-all active:scale-[0.99]",
            active === item.id && "border-primary/50 ring-primary/10 ring-2",
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{item.label}</p>
              <p className="text-muted-foreground text-xs">{item.window}</p>
            </div>
            <span className="font-mono text-xs uppercase text-muted-foreground">
              {demandBand(item.demand)}
            </span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${item.demand}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <MiniStat label="Demand" value={`${item.demand}`} />
            <MiniStat
              label="vs normal"
              value={`${item.delta > 0 ? "+" : ""}${item.delta}%`}
            />
            <MiniStat label="Confidence" value={`${item.confidence}%`} />
          </div>
        </Link>
      ))}
    </div>
  );
}

export function HotspotList({ hotspots }: { hotspots: HotspotEstimate[] }) {
  return (
    <div className="space-y-3">
      {hotspots.map((hotspot) => (
        <Card key={hotspot.id} className="p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{hotspot.label}</p>
              <p className="text-muted-foreground text-xs">
                {hotspot.startsAt}-{hotspot.endsAt} · {hotspot.radiusMeters}m
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums">{hotspot.score}</p>
              <p className="text-muted-foreground text-[10px] uppercase">
                score
              </p>
            </div>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${hotspot.score}%` }}
            />
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {hotspot.sources.map((source) => (
              <span
                key={source}
                className="bg-muted rounded-full px-2 py-1 text-[11px] font-medium"
              >
                {source}
              </span>
            ))}
          </div>
          <ul className="space-y-1.5">
            {hotspot.reasons.map((reason) => (
              <li
                key={reason}
                className="text-muted-foreground flex gap-2 text-sm leading-snug"
              >
                <Icon name="Check" className="mt-0.5 size-3.5 shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

export function SignalRows({ signals }: { signals: BusinessSignal[] }) {
  return (
    <div className="divide-border overflow-hidden rounded-2xl border bg-card">
      {signals.map((signal) => (
        <div key={`${signal.source}-${signal.signal}`} className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold leading-tight">{signal.signal}</p>
              <p className="text-muted-foreground text-xs">
                {signal.source} · {signal.horizon}
              </p>
            </div>
            <DirectionBadge direction={signal.direction} />
          </div>
          <div className="mb-2 flex items-end gap-2">
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {signal.value}
            </p>
            <p className="text-muted-foreground pb-1 text-xs">{signal.unit}</p>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {signal.explanation}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SourceHealthList({ items }: { items: SourceHealth[] }) {
  return (
    <div className="divide-border overflow-hidden rounded-2xl border bg-card">
      {items.map((item) => (
        <div key={item.source} className="flex items-center gap-3 p-4">
          <StatusDot status={item.status} />
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-tight">{item.source}</p>
            <p className="text-muted-foreground text-xs">{item.freshness}</p>
          </div>
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            {item.status.replace("_", " ")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SectionTitle({
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
          View <Icon name="ChevronRight" className="size-4" />
        </Link>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-[10px] uppercase">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function DirectionBadge({
  direction,
}: {
  direction: BusinessSignal["direction"];
}) {
  const label =
    direction === "positive"
      ? "uplift"
      : direction === "negative"
        ? "risk"
        : "context";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-1 text-[11px] font-semibold",
        direction === "positive" && "bg-success/12 text-success",
        direction === "negative" && "bg-danger/12 text-danger",
        direction === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: SourceHealth["status"] }) {
  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        status === "ok" && "bg-success",
        status === "degraded" && "bg-warning",
        status === "missing_credentials" && "bg-muted-foreground",
        status === "unavailable" && "bg-danger",
      )}
    />
  );
}
