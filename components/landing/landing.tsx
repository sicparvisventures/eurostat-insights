"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { TOPICS } from "@/lib/eurostat/registry";
import { fadeUp } from "@/lib/motion";

type LandingMode = "consumer" | "business";

export function Landing() {
  const [mode, setMode] = useState<LandingMode>("consumer");
  const isBusiness = mode === "business";

  return (
    <div className="mx-auto min-h-dvh w-full max-w-2xl">
      <header className="pt-safe flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-[15px] font-semibold tracking-tight">
            Eurostat Insights
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-5 pb-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mt-7"
        >
          <Segmented
            value={mode}
            onChange={setMode}
            className="w-full justify-center"
            options={[
              { value: "consumer", label: "Consumer" },
              { value: "business", label: "Business" },
            ]}
          />
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-muted-foreground mt-8 flex items-center gap-2 font-mono text-xs uppercase tracking-wider"
        >
          <span className="bg-success size-1.5 rounded-full" />
          {isBusiness
            ? "Hospitality command center · local signals"
            : "Official statistics · Eurostat"}
        </motion.p>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-4 text-[2.6rem] font-semibold leading-[1.08] tracking-tight"
        >
          {isBusiness ? (
            <>
              Forecast your restaurant
              <br />
              with local signals.
            </>
          ) : (
            <>
              European statistics,
              <br />
              made legible.
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
            ? "A clean operating view for restaurants, bars, cafes and hotels: demand forecast, weather, events, transit, competition and Eurostat market context."
            : "A focused dashboard for population, economy, digital and hospitality indicators — read straight from the official Eurostat database."}
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

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={5}
          className="mt-10"
        >
          {isBusiness ? <BusinessPreview /> : <IndexPreview />}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={6}
          className="mt-12"
        >
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-sm font-semibold">Explore by theme</p>
            <span className="text-muted-foreground font-mono text-xs">
              {TOPICS.length} areas
            </span>
          </div>
          <div className="divide-border border-border divide-y overflow-hidden rounded-2xl border">
            {TOPICS.map((t) => (
              <Link
                key={t.slug}
                href="/onboarding"
                className="hover:bg-muted/60 flex items-center gap-3.5 p-4 transition-colors"
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

        <p className="text-muted-foreground mt-12 text-xs leading-relaxed">
          Educational project for entertainment. Data source:{" "}
          <a
            href="https://ec.europa.eu/eurostat"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            Eurostat
          </a>
          , the statistical office of the European Union. © European Union,
          1995–{new Date().getFullYear()}.
        </p>
      </main>
    </div>
  );
}

/** Editorial preview panel — flat bars, illustrative, no gradients. */
function IndexPreview() {
  const rows = [
    { label: "Internet users", code: "ISOC_CI_IFP_IU", value: "91%", bars: [40, 52, 61, 70, 78, 85, 91] },
    { label: "Life expectancy", code: "DEMO_MLEXPEC", value: "81.5 yrs", bars: [78, 79, 80, 80, 81, 81, 82] },
    { label: "Hotel occupancy", code: "TOUR_OCC_ANOR", value: "42.7%", bars: [30, 22, 35, 40, 38, 41, 43] },
  ];
  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="border-border flex items-center justify-between border-b px-4 py-2.5">
        <span className="text-xs font-semibold">European Union · latest</span>
        <span className="text-muted-foreground font-mono text-[10px] uppercase">
          live
        </span>
      </div>
      <div className="divide-border divide-y">
        {rows.map((r) => (
          <div key={r.code} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">{r.label}</p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase">
                {r.code}
              </p>
            </div>
            <div className="flex h-7 items-end gap-[3px]">
              {r.bars.map((b, i) => (
                <motion.span
                  key={i}
                  className="w-1.5 rounded-[1px]"
                  style={{ background: "var(--color-chart-1)" }}
                  initial={{ height: 0, opacity: 0.4 }}
                  animate={{ height: `${b}%`, opacity: 0.35 + (b / 100) * 0.65 }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                />
              ))}
            </div>
            <span className="w-16 text-right text-sm font-semibold tabular-nums">
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessPreview() {
  const rows = [
    {
      label: "Dinner demand",
      source: "weather · events · transit",
      value: "+18%",
      bars: [34, 42, 51, 58, 71, 78, 74],
    },
    {
      label: "Weather effect",
      source: "Open-Meteo",
      value: "good",
      bars: [48, 54, 62, 70, 72, 69, 63],
    },
    {
      label: "Competitor heat",
      source: "OSM · POI density",
      value: "61",
      bars: [46, 50, 56, 58, 60, 61, 61],
    },
  ];

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="border-border flex items-center justify-between border-b px-4 py-2.5">
        <span className="text-xs font-semibold">Brussels · today</span>
        <span className="text-muted-foreground font-mono text-[10px] uppercase">
          forecast
        </span>
      </div>
      <div className="divide-border divide-y">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">{r.label}</p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase">
                {r.source}
              </p>
            </div>
            <div className="flex h-7 items-end gap-[3px]">
              {r.bars.map((b, i) => (
                <motion.span
                  key={i}
                  className="w-1.5 rounded-[1px]"
                  style={{ background: "var(--color-chart-2)" }}
                  initial={{ height: 0, opacity: 0.4 }}
                  animate={{ height: `${b}%`, opacity: 0.35 + (b / 100) * 0.65 }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                />
              ))}
            </div>
            <span className="w-16 text-right text-sm font-semibold tabular-nums">
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
