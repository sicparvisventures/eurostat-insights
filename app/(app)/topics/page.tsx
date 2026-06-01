import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { AppHeader } from "@/components/shell/app-header";
import { Icon } from "@/components/ui/icon";
import { TOPICS } from "@/lib/eurostat/registry";

export const metadata: Metadata = {
  title: "Topics",
  description: "Curated dashboards across European statistics.",
};

export default function TopicsPage() {
  return (
    <div>
      <AppHeader title="Topics" subtitle="Curated European dashboards" />
      <div className="space-y-4 px-5 pt-2">
        <div className="grid gap-4 lg:grid-cols-2">
        {TOPICS.map((t) => (
          <Link
            key={t.slug}
            href={`/topics/${t.slug}`}
            className="group block overflow-hidden rounded-2xl border border-border transition-colors hover:border-foreground/20 active:scale-[0.995]"
          >
            <div className="relative min-h-48 overflow-hidden p-5 text-white">
              <Image
                src={t.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/45" />
              <div
                className="absolute inset-0 opacity-35"
                style={{ background: t.accent }}
              />
              <div className="relative mb-8 flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                  <Icon name={t.icon} className="size-5" />
                </div>
                <Icon
                  name="ArrowUpRight"
                  className="size-5 text-white/70 transition-transform group-hover:translate-x-0.5"
                />
              </div>
              <h2 className="relative text-lg font-semibold tracking-tight">
                {t.title}
              </h2>
              <p className="relative mt-1 text-sm text-white/90">
                {t.description}
              </p>
            </div>
            <div className="bg-card flex flex-wrap gap-1.5 p-3">
              {t.metrics.map((m) => (
                <span
                  key={m.id}
                  className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-xs font-medium"
                >
                  {m.short}
                </span>
              ))}
            </div>
          </Link>
        ))}
        </div>

        <Link
          href="/explore"
          className="border-border bg-card flex items-center gap-4 rounded-2xl border p-5 transition-transform active:scale-[0.99]"
        >
          <div className="bg-primary/15 text-primary flex size-12 items-center justify-center rounded-xl">
            <Icon name="Compass" className="size-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Looking for something else?</p>
            <p className="text-muted-foreground text-sm">
              Search the full Eurostat catalogue
            </p>
          </div>
          <Icon name="ChevronRight" className="text-muted-foreground size-5" />
        </Link>
      </div>
    </div>
  );
}
