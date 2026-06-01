"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/brand/logo";
import {
  BusinessTypePicker,
  LocationSliders,
} from "@/components/business/location-form";
import { eur } from "@/components/business/business-widgets";
import {
  newLocation,
  useBusinessStore,
  type LocationConfig,
} from "@/lib/store/business";
import { computeForecast } from "@/lib/business/forecast";
import { EU_COUNTRIES } from "@/lib/eurostat/constants";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

const STEPS = ["group", "location", "config", "review"] as const;

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [groupName, setGroupName] = useState("");
  const [country, setCountry] = useState("BE");
  const [draft, setDraft] = useState<LocationConfig>(() => newLocation());

  const { setGroup, addLocation, completeOnboarding } = useBusinessStore();

  const update = (patch: Partial<LocationConfig>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const isLast = step === STEPS.length - 1;
  const canProceed =
    step === 1 ? draft.name.trim().length > 0 && draft.city.trim().length > 0 : true;

  const preview = useMemo(
    () => computeForecast({ ...draft, country }, { seasonIndex: 1 }),
    [draft, country],
  );

  function finish() {
    setGroup({ name: groupName || draft.name || "My group", country });
    addLocation({ ...draft, country, name: draft.name || "Main location" });
    completeOnboarding();
    router.push("/business/home");
  }

  function next() {
    if (isLast) finish();
    else setStep((s) => s + 1);
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 lg:px-8">
      <header className="pt-safe flex items-center justify-between py-4">
        <Logo size={30} />
        <button
          onClick={finish}
          className="text-muted-foreground text-sm font-medium"
        >
          Skip
        </button>
      </header>

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
              <Step
                title="Set up your group"
                subtitle="A group can hold one location or a whole district. We start the forecast from the average restaurant in your country, then tune it to you."
              >
                <Field label="Group / company name">
                  <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="PP Group"
                    className="field-input"
                  />
                </Field>
                <Field label="Country">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="field-input"
                  >
                    {EU_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </Step>
            )}

            {step === 1 && (
              <Step
                title="Add your first location"
                subtitle="The city anchors live weather and local demand. Add more sites later from Locations."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Location name">
                    <input
                      value={draft.name}
                      onChange={(e) => update({ name: e.target.value })}
                      placeholder="KM11"
                      className="field-input"
                    />
                  </Field>
                  <Field label="City">
                    <input
                      value={draft.city}
                      onChange={(e) => update({ city: e.target.value })}
                      placeholder="Gent"
                      className="field-input"
                    />
                  </Field>
                </div>
                <p className="text-muted-foreground mt-5 mb-2 text-xs font-medium">
                  Type of business
                </p>
                <BusinessTypePicker
                  value={draft.businessType}
                  onChange={(businessType) => update({ businessType })}
                />
              </Step>
            )}

            {step === 2 && (
              <Step
                title="Tune the model"
                subtitle="Drag to roughly match your site — these turn demand into covers, staffing and budget."
              >
                <LocationSliders value={draft} onChange={update} />
              </Step>
            )}

            {step === 3 && (
              <Step
                title="Your forecast is ready"
                subtitle="A normal-day baseline from your setup. Live weather, season and events adjust it daily inside the command center."
              >
                <div className="border-border bg-card rounded-2xl border p-5">
                  <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                    Normal day · {draft.name || "your location"}
                  </p>
                  <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">
                    {eur(preview.revenue)}
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <Preview label="Covers" value={`${preview.covers}`} />
                    <Preview label="Avg ticket" value={eur(preview.avgTicket)} />
                    <Preview
                      label="Labour"
                      value={`${(preview.laborRatio * 100).toFixed(0)}%`}
                    />
                    <Preview
                      label="Staff hours"
                      value={`${preview.laborHours}h`}
                    />
                    <Preview
                      label="Productivity"
                      value={`${eur(preview.productivity)}/h`}
                    />
                    <Preview
                      label="Weekly budget"
                      value={eur(preview.weeklyBudget)}
                    />
                  </div>
                </div>
              </Step>
            )}
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
        <Button size="lg" className="flex-1" onClick={next} disabled={!canProceed}>
          {isLast ? "Enter command center" : "Continue"}
          <Icon name={isLast ? "Sparkles" : "ArrowRight"} />
        </Button>
      </div>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <p className="text-muted-foreground mb-2 font-mono text-xs uppercase tracking-wider">
          Hospitality Business Mode
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-balance">
          {title}
        </h2>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-xl p-3">
      <p className="text-muted-foreground text-[10px] uppercase">{label}</p>
      <p className="mt-1 font-bold tabular-nums">{value}</p>
    </div>
  );
}
