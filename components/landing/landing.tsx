"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { TOPICS } from "@/lib/eurostat/registry";
import { usePersonalization, useHasHydrated } from "@/lib/store/personalization";
import { fadeUp } from "@/lib/motion";

export function Landing() {
  const router = useRouter();
  const onboarded = usePersonalization((s) => s.onboarded);
  const hydrated = useHasHydrated();

  useEffect(() => {
    if (hydrated && onboarded) router.replace("/home");
  }, [hydrated, onboarded, router]);

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
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="text-muted-foreground mt-8 flex items-center gap-2 font-mono text-xs uppercase tracking-wider"
        >
          <span className="bg-success size-1.5 rounded-full" />
          Official statistics · Eurostat
        </motion.p>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-4 text-[2.6rem] font-semibold leading-[1.08] tracking-tight"
        >
          European statistics,
          <br />
          made legible.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed"
        >
          A focused dashboard for population, economy, digital and hospitality
          indicators — read straight from the official Eurostat database.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-7 flex flex-col gap-2.5 sm:flex-row"
        >
          <Button asChild size="lg" className="flex-1">
            <Link href="/onboarding">
              Get started
              <Icon name="ArrowRight" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="flex-1">
            <Link href="/explore">Browse the data</Link>
          </Button>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-10"
        >
          <IndexPreview />
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={5}
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
