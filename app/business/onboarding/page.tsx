"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/brand/logo";
import { BUSINESS_SIGNAL_SOURCES } from "@/lib/business/signals";
import {
  useBusinessStore,
  type BusinessProfile,
  type BusinessType,
  type ForecastGoal,
} from "@/lib/store/business";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

const STEPS = ["profile", "location", "capacity", "goals", "sources"] as const;

const BUSINESS_TYPES: { value: BusinessType; label: string; icon: string }[] = [
  { value: "restaurant", label: "Restaurant", icon: "Utensils" },
  { value: "bar", label: "Bar", icon: "Martini" },
  { value: "cafe", label: "Cafe", icon: "Coffee" },
  { value: "hotel", label: "Hotel restaurant", icon: "BedDouble" },
  { value: "catering", label: "Catering", icon: "ChefHat" },
  { value: "qsr", label: "QSR", icon: "Store" },
  { value: "dark-kitchen", label: "Dark kitchen", icon: "Truck" },
];

const GOALS: { value: ForecastGoal; label: string; description: string }[] = [
  {
    value: "covers",
    label: "Covers",
    description: "Translate demand into expected guests.",
  },
  {
    value: "staff",
    label: "Staff hours",
    description: "Plan floor, kitchen and delivery coverage.",
  },
  {
    value: "stock",
    label: "Stock",
    description: "Prepare food and beverage buffers.",
  },
  {
    value: "revenue",
    label: "Revenue",
    description: "Use average ticket and price pressure.",
  },
  {
    value: "marketing",
    label: "Marketing",
    description: "Spot slow windows and demand spikes.",
  },
];

type ProfileStepProps = {
  profile: BusinessProfile;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
};

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const {
    profile,
    updateProfile,
    toggleGoal,
    toggleSource,
    completeOnboarding,
  } = useBusinessStore();

  const isLast = step === STEPS.length - 1;
  const canProceed =
    step === 0
      ? profile.businessName.trim().length > 0
      : step === 1
        ? profile.city.trim().length > 0
        : step === 3
          ? profile.goals.length > 0
          : true;

  function next() {
    if (isLast) {
      completeOnboarding();
      router.push("/business/home");
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
            router.push("/business/home");
          }}
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
              <StepProfile profile={profile} updateProfile={updateProfile} />
            )}
            {step === 1 && (
              <StepLocation profile={profile} updateProfile={updateProfile} />
            )}
            {step === 2 && (
              <StepCapacity profile={profile} updateProfile={updateProfile} />
            )}
            {step === 3 && (
              <StepGoals goals={profile.goals} toggleGoal={toggleGoal} />
            )}
            {step === 4 && (
              <StepSources
                connected={profile.connectedSources}
                toggleSource={toggleSource}
              />
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
        <Button
          size="lg"
          className="flex-1"
          onClick={next}
          disabled={!canProceed}
        >
          {isLast ? "Enter Business Mode" : "Continue"}
          <Icon name={isLast ? "Sparkles" : "ArrowRight"} />
        </Button>
      </div>
    </div>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <p className="text-muted-foreground mb-2 font-mono text-xs uppercase tracking-wider">
        Hospitality Business Mode
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-balance">{title}</h2>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
  );
}

function StepProfile({
  profile,
  updateProfile,
}: ProfileStepProps) {
  return (
    <div>
      <StepHeader
        title="Set up your business"
        subtitle="This creates the peer group for demand, staffing and market signals."
      />
      <div className="space-y-4">
        <Field label="Business name">
          <input
            value={profile.businessName}
            onChange={(e) => updateProfile({ businessName: e.target.value })}
            placeholder="Maison Central"
            className="field-input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2.5">
          {BUSINESS_TYPES.map((type) => {
            const active = profile.businessType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => updateProfile({ businessType: type.value })}
                aria-pressed={active}
                className={cn(
                  "flex min-h-24 flex-col justify-between rounded-2xl border p-3 text-left transition-all active:scale-[0.99]",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                <Icon name={type.icon} className="size-5" />
                <span className="text-sm font-semibold">{type.label}</span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cuisine">
            <input
              value={profile.cuisine}
              onChange={(e) => updateProfile({ cuisine: e.target.value })}
              placeholder="Belgian, Italian..."
              className="field-input"
            />
          </Field>
          <Field label="Price tier">
            <select
              value={profile.priceTier}
              onChange={(e) =>
                updateProfile({
                  priceTier: e.target.value as typeof profile.priceTier,
                })
              }
              className="field-input"
            >
              <option value="budget">Budget</option>
              <option value="casual">Casual</option>
              <option value="premium">Premium</option>
              <option value="fine">Fine dining</option>
            </select>
          </Field>
        </div>
      </div>
    </div>
  );
}

function StepLocation({
  profile,
  updateProfile,
}: ProfileStepProps) {
  return (
    <div>
      <StepHeader
        title="Anchor the location"
        subtitle="The MVP uses city and country now; geocoding and NUTS matching can attach real coordinates next."
      />
      <div className="space-y-4">
        <Field label="Street address">
          <input
            value={profile.address}
            onChange={(e) => updateProfile({ address: e.target.value })}
            placeholder="Rue du Marché aux Herbes 1"
            className="field-input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input
              value={profile.city}
              onChange={(e) => updateProfile({ city: e.target.value })}
              placeholder="Brussels"
              className="field-input"
            />
          </Field>
          <Field label="Country code">
            <input
              value={profile.country}
              onChange={(e) =>
                updateProfile({ country: e.target.value.toUpperCase() })
              }
              maxLength={2}
              placeholder="BE"
              className="field-input uppercase"
            />
          </Field>
        </div>
        <div className="border-border bg-card rounded-2xl border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="MapPinned" className="text-primary size-4" />
            <p className="text-sm font-semibold">Derived catchments</p>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {["250m", "500m", "1km", "3km", "10km"].map((radius) => (
              <span
                key={radius}
                className="bg-muted rounded-full px-2 py-1.5 text-xs font-medium"
              >
                {radius}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCapacity({
  profile,
  updateProfile,
}: ProfileStepProps) {
  return (
    <div>
      <StepHeader
        title="Operational model"
        subtitle="Capacity turns a demand score into covers, stock and staffing decisions."
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Seats"
          value={profile.seats}
          onChange={(seats) => updateProfile({ seats })}
        />
        <NumberField
          label="Terrace seats"
          value={profile.terraceSeats}
          onChange={(terraceSeats) => updateProfile({ terraceSeats })}
        />
        <NumberField
          label="Avg. ticket"
          value={profile.averageTicket}
          onChange={(averageTicket) => updateProfile({ averageTicket })}
          prefix="EUR"
        />
        <Field label="Chain mode">
          <select
            value={profile.chainMode}
            onChange={(e) =>
              updateProfile({
                chainMode: e.target.value as typeof profile.chainMode,
              })
            }
            className="field-input"
          >
            <option value="single">Single location</option>
            <option value="multi">Multiple locations</option>
          </select>
        </Field>
      </div>
      <button
        onClick={() => updateProfile({ delivery: !profile.delivery })}
        aria-pressed={profile.delivery}
        className="border-border bg-card mt-4 flex w-full items-center justify-between rounded-2xl border p-4"
      >
        <div className="flex items-center gap-3 text-left">
          <Icon name="Truck" className="text-primary size-5" />
          <div>
            <p className="font-semibold">Delivery channel</p>
            <p className="text-muted-foreground text-sm">
              Include bad-weather delivery uplift.
            </p>
          </div>
        </div>
        <Switch active={profile.delivery} />
      </button>
    </div>
  );
}

function StepGoals({
  goals,
  toggleGoal,
}: {
  goals: ForecastGoal[];
  toggleGoal: (goal: ForecastGoal) => void;
}) {
  return (
    <div>
      <StepHeader
        title="Choose forecast goals"
        subtitle="The command center will prioritize the decisions you make every week."
      />
      <div className="space-y-3">
        {GOALS.map((goal) => {
          const active = goals.includes(goal.value);
          return (
            <button
              key={goal.value}
              onClick={() => toggleGoal(goal.value)}
              aria-pressed={active}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                active
                  ? "border-primary bg-primary/5 ring-primary/10 ring-2"
                  : "border-border bg-card",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{goal.label}</p>
                <p className="text-muted-foreground text-sm">
                  {goal.description}
                </p>
              </div>
              <Check active={active} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSources({
  connected,
  toggleSource,
}: {
  connected: string[];
  toggleSource: (source: string) => void;
}) {
  return (
    <div>
      <StepHeader
        title="Source consent"
        subtitle="Open sources are enabled by default. Credentialed event and footfall sources can be connected later."
      />
      <div className="space-y-3">
        {BUSINESS_SIGNAL_SOURCES.map((source) => {
          const active = connected.includes(source.id);
          return (
            <button
              key={source.id}
              onClick={() => toggleSource(source.id)}
              aria-pressed={active}
              className="border-border bg-card flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]"
            >
              <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Icon name={source.icon} className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{source.title}</p>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {source.description}
                </p>
              </div>
              <Switch active={active} />
            </button>
          );
        })}
      </div>
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
    <label className="block">
      <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        {prefix && (
          <span className="text-muted-foreground pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn("field-input", prefix && "pl-12")}
        />
      </div>
    </Field>
  );
}

function Switch({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors",
        active ? "bg-primary justify-end" : "bg-muted justify-start",
      )}
    >
      <span className="bg-card size-5 rounded-full shadow" />
    </span>
  );
}

function Check({ active }: { active: boolean }) {
  return (
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
  );
}
