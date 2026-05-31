"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { TOPICS } from "@/lib/eurostat/registry";
import { EU_AGGREGATE, EU_COUNTRIES } from "@/lib/eurostat/constants";
import {
  usePersonalization,
  type TopicSlug,
} from "@/lib/store/personalization";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

const STEPS = ["welcome", "interests", "country", "theme"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const {
    name,
    interests,
    country,
    setName,
    toggleInterest,
    setCountry,
    completeOnboarding,
  } = usePersonalization();

  const isLast = step === STEPS.length - 1;
  const canProceed = step === 1 ? interests.length > 0 : true;

  function next() {
    if (isLast) {
      completeOnboarding();
      router.push("/home");
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5">
      <header className="pt-safe flex items-center justify-between py-4">
        <Logo size={30} />
        <button
          onClick={() => {
            completeOnboarding();
            router.push("/home");
          }}
          className="text-muted-foreground text-sm font-medium"
        >
          Skip
        </button>
      </header>

      {/* progress */}
      <div className="flex gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={STEPS[step]}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="flex-1"
          >
            {step === 0 && (
              <StepWelcome name={name} setName={setName} />
            )}
            {step === 1 && (
              <StepInterests
                interests={interests}
                toggle={toggleInterest}
              />
            )}
            {step === 2 && (
              <StepCountry country={country} setCountry={setCountry} />
            )}
            {step === 3 && <StepTheme name={name} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-safe flex items-center gap-3">
        {step > 0 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setStep((s) => s - 1)}
            aria-label="Back"
          >
            <Icon name="ArrowLeft" />
          </Button>
        )}
        <Button
          size="lg"
          className="flex-1"
          onClick={next}
          disabled={!canProceed}
        >
          {isLast ? "Enter Insights" : "Continue"}
          <Icon name={isLast ? "Sparkles" : "ArrowRight"} />
        </Button>
      </div>
    </div>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold tracking-tight text-balance">{title}</h2>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
  );
}

function StepWelcome({
  name,
  setName,
}: {
  name: string;
  setName: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-6 flex justify-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
        >
          <Logo size={72} />
        </motion.div>
      </div>
      <StepHeader
        title="Welcome to Insights"
        subtitle="Let's personalise your dashboard. First, what should we call you?"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        autoComplete="off"
        className="border-border bg-card focus:border-primary focus:ring-primary/20 w-full rounded-2xl border px-4 py-3.5 text-base outline-none transition-colors focus:ring-4"
      />
    </div>
  );
}

function StepInterests({
  interests,
  toggle,
}: {
  interests: TopicSlug[];
  toggle: (s: TopicSlug) => void;
}) {
  return (
    <div>
      <StepHeader
        title="What interests you?"
        subtitle="Pick the themes you care about. We'll feature them on your home screen."
      />
      <div className="space-y-3">
        {TOPICS.map((t) => {
          const active = interests.includes(t.slug as TopicSlug);
          return (
            <button
              key={t.slug}
              onClick={() => toggle(t.slug as TopicSlug)}
              aria-pressed={active}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                active
                  ? "border-primary bg-primary/5 ring-primary/10 ring-2"
                  : "border-border bg-card",
              )}
            >
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: t.accent }}
              >
                <Icon name={t.icon} className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t.title}</p>
                <p className="text-muted-foreground text-sm">{t.description}</p>
              </div>
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {active && <Icon name="Check" className="size-4" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepCountry({
  country,
  setCountry,
}: {
  country: string;
  setCountry: (c: string) => void;
}) {
  const all = [EU_AGGREGATE, ...EU_COUNTRIES];
  return (
    <div>
      <StepHeader
        title="Your home base"
        subtitle="Choose a country or region to focus on. You can change this anytime."
      />
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {all.map((c) => {
          const active = c.code === country;
          return (
            <button
              key={c.code}
              onClick={() => setCountry(c.code)}
              aria-pressed={active}
              className={cn(
                "flex min-h-20 flex-col items-start justify-between rounded-xl border p-3 text-left transition-all active:scale-95",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              <span className="font-mono text-lg font-semibold tracking-normal">
                {c.displayCode}
              </span>
              <span
                className={cn(
                  "line-clamp-2 text-xs leading-tight",
                  active ? "text-primary-foreground/75" : "text-muted-foreground",
                )}
              >
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepTheme({ name }: { name: string }) {
  return (
    <div className="flex h-full flex-col">
      <StepHeader
        title={name ? `You're all set, ${name}` : "You're all set"}
        subtitle="Pick your look. Everything else is ready — built on official Eurostat data."
      />
      <div className="bg-card border-border flex items-center justify-between rounded-2xl border p-4">
        <span className="font-medium">Appearance</span>
        <ThemeToggle />
      </div>

      <div className="mt-auto pt-8">
        <div className="bg-muted border-border rounded-2xl border p-5">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="Sparkles" className="size-5" />
            <span className="font-semibold">Ready to explore</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Your personalised dashboard awaits — live charts, country
            comparisons and interactive maps across European statistics.
          </p>
        </div>
      </div>
    </div>
  );
}
