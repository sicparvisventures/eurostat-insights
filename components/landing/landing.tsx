"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteFooter } from "@/components/landing/site-footer";
import { TOPICS } from "@/lib/eurostat/registry";
import { BRAND_NAME } from "@/lib/brand";
import { fadeUp } from "@/lib/motion";

type LandingMode = "consumer" | "business";

const MODE_OPTIONS = [
  { value: "consumer" as const, label: "Consumer" },
  { value: "business" as const, label: "Business" },
];

export function Landing() {
  const [mode, setMode] = useState<LandingMode>("consumer");
  const isBusiness = mode === "business";

  return (
    <div className="mx-auto min-h-dvh w-full max-w-5xl">
      <header className="pt-safe relative flex items-center justify-between px-5 py-4 lg:px-8">
        <div className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-[15px] font-semibold tracking-tight">
            {BRAND_NAME}
          </span>
        </div>
        {/* Centered mode toggle — desktop only */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
          <Segmented value={mode} onChange={setMode} options={MODE_OPTIONS} />
        </div>
        <ThemeToggle />
      </header>

      <main className="px-5 pb-4 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 lg:pt-6">
          <div>
            {/* Mobile-only mode toggle */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="mt-7 lg:hidden"
            >
              <Segmented
                value={mode}
                onChange={setMode}
                className="w-full justify-center"
                options={MODE_OPTIONS}
              />
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="text-muted-foreground mt-8 flex items-center gap-2 font-mono text-xs uppercase tracking-wider lg:mt-0"
            >
              <span className="bg-success size-1.5 rounded-full" />
              {isBusiness
                ? "Hospitality command center"
                : "Official statistics · Eurostat"}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-4 text-[2.6rem] font-semibold leading-[1.08] tracking-tight lg:text-[3.4rem]"
            >
              {isBusiness ? (
                <>
                  Forecast your restaurant,
                  <br />
                  before the day starts.
                </>
              ) : (
                <>
                  The measure
                  <br />
                  of Europe.
                </>
              )}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed"
            >
              {isBusiness
                ? "Set up your site in a minute. Statera turns your capacity, live weather and Eurostat market context into a daily revenue, covers and staffing forecast — per location and across the group."
                : "Population, economy, digital and tourism — read straight from the official Eurostat database, in a dashboard built to make the numbers legible and genuinely useful."}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-7 flex flex-col gap-2.5 sm:flex-row"
            >
              <Button asChild size="lg" className="flex-1">
                <Link href={isBusiness ? "/business/onboarding" : "/onboarding"}>
                  {isBusiness ? "Set up Business Mode" : "Get started"}
                  <Icon name="ArrowRight" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="flex-1">
                <Link href={isBusiness ? "/business/home" : "/explore"}>
                  {isBusiness ? "Open command center" : "Browse the data"}
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="mt-10 lg:mt-0"
          >
            {isBusiness ? <BusinessPreview /> : <IndexPreview />}
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={6}
          className="mt-14"
        >
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-sm font-semibold">Explore by theme</p>
            <span className="text-muted-foreground font-mono text-xs">
              {TOPICS.length} areas
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {TOPICS.map((t) => (
              <Link
                key={t.slug}
                href="/onboarding"
                className="border-border hover:bg-muted/60 flex items-center gap-3.5 rounded-2xl border p-4 transition-colors"
              >
                <div
                  className="flex size-10 items-center justify-center rounded-lg text-white"
                  style={{ background: t.accent }}
                >
                  <Icon name={t.icon} className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{t.title}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    {t.tagline}
                  </p>
                </div>
                <Icon
                  name="ChevronRight"
                  className="text-muted-foreground size-4 shrink-0"
                />
              </Link>
            ))}
          </div>
        </motion.div>

        <SiteFooter />
        <div className="pb-10" />
      </main>
    </div>
  );
}

interface PreviewRow {
  label: string;
  desc: string;
  value: string;
  pct: number;
}

function PreviewCard({
  heading,
  caption,
  rows,
}: {
  heading: string;
  caption: string;
  rows: PreviewRow[];
}) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold">{heading}</span>
        <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide">
          <span className="bg-success size-1.5 rounded-full" />
          live
        </span>
      </div>
      <div className="divide-border divide-y">
        {rows.map((r, i) => (
          <div key={r.label} className="px-4 py-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-tight">{r.label}</p>
                <p className="text-muted-foreground text-xs">{r.desc}</p>
              </div>
              <p className="text-xl font-bold tabular-nums">{r.value}</p>
            </div>
            <div className="bg-muted mt-2.5 h-1.5 overflow-hidden rounded-full">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--color-chart-1)" }}
                initial={{ width: 0 }}
                animate={{ width: `${r.pct}%` }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.6 }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground border-border border-t px-4 py-2.5 text-xs">
        {caption}
      </p>
    </div>
  );
}

function IndexPreview() {
  return (
    <PreviewCard
      heading="European Union · latest"
      caption="Tap any indicator to open its full chart and country map."
      rows={[
        { label: "Internet users", desc: "9 in 10 people online", value: "91%", pct: 91 },
        { label: "Life expectancy", desc: "years at birth", value: "81.5", pct: 90 },
        { label: "Hotel occupancy", desc: "bed-places filled", value: "42.7%", pct: 43 },
      ]}
    />
  );
}

function BusinessPreview() {
  return (
    <PreviewCard
      heading="Your restaurant · today"
      caption="Built from your setup, live weather and Eurostat context."
      rows={[
        { label: "Forecast revenue", desc: "vs a normal day", value: "€5.4k", pct: 78 },
        { label: "Dinner demand", desc: "event + dry evening", value: "+18%", pct: 82 },
        { label: "Staff to plan", desc: "hours today", value: "59h", pct: 60 },
      ]}
    />
  );
}
