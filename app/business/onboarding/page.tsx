"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/brand/logo";
import {
  BusinessTypePicker,
  CitySelect,
  LocationSliders,
} from "@/components/business/location-form";
import { eur } from "@/components/business/business-widgets";
import {
  cloneLocation,
  newLocation,
  useBusinessStore,
  type LocationConfig,
} from "@/lib/store/business";
import { citiesForCountry } from "@/lib/business/cities";
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
  const [built, setBuilt] = useState<LocationConfig[]>([]);
  const [draft, setDraft] = useState<LocationConfig>(() =>
    newLocation({ city: citiesForCountry("BE")[0] }),
  );

  const { setGroup, addLocation, completeOnboarding } = useBusinessStore();

  const update = (patch: Partial<LocationConfig>) =>
    setDraft((d) => ({ ...d, ...patch }));

  function changeCountry(c: string) {
    setCountry(c);
    setDraft((d) => ({ ...d, country: c, city: citiesForCountry(c)[0] }));
  }

  const isLast = step === STEPS.length - 1;
  const canProceed = step === 1 ? draft.name.trim().length > 0 : true;

  const preview = useMemo(
    () => computeForecast({ ...draft, country }, { seasonIndex: 1 }),
    [draft, country],
  );

  function addAnother() {
    setBuilt((b) => [...b, { ...draft, country }]);
    // Copy the economics into a fresh draft so similar sites are fast to add.
    setDraft((d) => cloneLocation(d, { name: "", country }));
    setStep(1);
  }

  function finish() {
    const all = [...built, draft].filter((l) => l.name.trim().length > 0);
    setGroup({ name: groupName || all[0]?.name || "My group", country });
    (all.length ? all : [{ ...draft, name: "Main location" }]).forEach((l) =>
      addLocation({ ...l, country }),
    );
    completeOnboarding();
    router.push("/business/home");
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
                subtitle="A group can hold one site or a whole district. We start from the average restaurant in your country, then tune it to you and add the outside intelligence."
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
                    onChange={(e) => changeCountry(e.target.value)}
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
                title={
                  built.length
                    ? `Add location ${built.length + 1}`
                    : "Add your first location"
                }
                subtitle="The city anchors live weather and local demand. You can add more sites in a moment."
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
                    <CitySelect
                      country={country}
                      value={draft.city}
                      onChange={(city) => update({ city })}
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
                title="Forecast ready"
                subtitle="A normal-day baseline from your setup. Live weather, season and events adjust it daily in the command center."
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
                  </div>
                </div>

                {built.length > 0 && (
                  <div className="mt-4">
                    <p className="text-muted-foreground mb-2 text-xs font-medium">
                      Already added
                    </p>
                    <div className="space-y-2">
                      {built.map((l, i) => (
                        <div
                          key={l.id}
                          className="border-border bg-card flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm"
                        >
                          <Icon
                            name="Store"
                            className="text-muted-foreground size-4"
                          />
                          <span className="flex-1 font-medium">
                            {l.name} · {l.city}
                          </span>
                          <button
                            onClick={() =>
                              setBuilt((b) => b.filter((_, j) => j !== i))
                            }
                            aria-label={`Remove ${l.name}`}
                            className="text-muted-foreground hover:text-danger"
                          >
                            <Icon name="X" className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={addAnother}
                  disabled={!draft.name.trim()}
                >
                  <Icon name="Plus" /> Add another location (copies this setup)
                </Button>
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
          {isLast
            ? `Enter command center${built.length ? ` · ${built.length + 1} sites` : ""}`
            : "Continue"}
          <Icon name={isLast ? "Sparkles" : "ArrowRight"} />
        </Button>
      </div>
    </div>
  );

  function next() {
    if (isLast) finish();
    else setStep((s) => s + 1);
  }
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
