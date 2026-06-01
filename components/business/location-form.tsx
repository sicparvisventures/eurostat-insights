"use client";

import { Icon } from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";
import { ChipBar } from "@/components/ui/chip-bar";
import {
  PRICE_TIER_TICKET,
  type BusinessType,
  type LocationConfig,
  type PriceTier,
} from "@/lib/store/business";
import { cn } from "@/lib/utils";

export const BUSINESS_TYPES: {
  value: BusinessType;
  label: string;
  icon: string;
}[] = [
  { value: "restaurant", label: "Restaurant", icon: "Utensils" },
  { value: "bar", label: "Bar", icon: "Martini" },
  { value: "cafe", label: "Cafe", icon: "Coffee" },
  { value: "hotel", label: "Hotel", icon: "BedDouble" },
  { value: "catering", label: "Catering", icon: "ChefHat" },
  { value: "qsr", label: "QSR", icon: "Store" },
  { value: "dark-kitchen", label: "Dark kitchen", icon: "Truck" },
];

const PRICE_TIERS: { value: PriceTier; label: string }[] = [
  { value: "budget", label: "Budget" },
  { value: "casual", label: "Casual" },
  { value: "premium", label: "Premium" },
  { value: "fine", label: "Fine" },
];

const eur = (v: number) => `€${v}`;

export function BusinessTypePicker({
  value,
  onChange,
}: {
  value: BusinessType;
  onChange: (value: BusinessType) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {BUSINESS_TYPES.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            aria-pressed={active}
            className={cn(
              "flex min-h-20 flex-col justify-between rounded-2xl border p-3 text-left transition-all active:scale-[0.98]",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            <Icon name={t.icon} className="size-5" />
            <span className="text-xs font-semibold leading-tight">
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Slider-driven economics for a location. Used in onboarding + settings. */
export function LocationSliders({
  value,
  onChange,
}: {
  value: LocationConfig;
  onChange: (patch: Partial<LocationConfig>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">
          Price tier
        </p>
        <ChipBar
          ariaLabel="Price tier"
          value={value.priceTier}
          onChange={(t) =>
            onChange({
              priceTier: t,
              avgTicket: PRICE_TIER_TICKET[t],
            })
          }
          options={PRICE_TIERS.map((t) => ({ value: t.value, label: t.label }))}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Slider
          label="Indoor seats"
          value={value.seats}
          min={0}
          max={200}
          onChange={(seats) => onChange({ seats })}
        />
        <Slider
          label="Terrace seats"
          value={value.terraceSeats}
          min={0}
          max={120}
          onChange={(terraceSeats) => onChange({ terraceSeats })}
        />
        <Slider
          label="Average ticket"
          value={value.avgTicket}
          min={8}
          max={150}
          format={eur}
          onChange={(avgTicket) => onChange({ avgTicket })}
        />
        <Slider
          label="Open days / week"
          value={value.openDays}
          min={1}
          max={7}
          format={(v) => `${v} days`}
          onChange={(openDays) => onChange({ openDays })}
        />
        <Slider
          label="Dinner focus"
          value={value.dinnerFocus}
          min={0}
          max={100}
          format={(v) => (v >= 60 ? "Dinner-led" : v <= 40 ? "Lunch-led" : "Balanced")}
          hint="Shifts trade between lunch and dinner."
          onChange={(dinnerFocus) => onChange({ dinnerFocus })}
        />
        <Slider
          label="Weather sensitivity"
          value={value.weatherSensitivity}
          min={0}
          max={100}
          format={(v) => `${v}%`}
          hint="How much terrace/walk-in swings with weather."
          onChange={(weatherSensitivity) => onChange({ weatherSensitivity })}
        />
        <Slider
          label="Labour cost / hour"
          value={value.laborHourCost}
          min={10}
          max={40}
          step={0.5}
          format={(v) => `€${v.toFixed(1)}`}
          onChange={(laborHourCost) => onChange({ laborHourCost })}
        />
        <Slider
          label="Staff hours / €1,000"
          value={value.targetStaffHoursPer1000}
          min={6}
          max={30}
          step={0.5}
          format={(v) => `${v.toFixed(1)}h`}
          hint="Your staffing benchmark, like the daily report."
          onChange={(targetStaffHoursPer1000) =>
            onChange({ targetStaffHoursPer1000 })
          }
        />
      </div>

      <button
        onClick={() => onChange({ delivery: !value.delivery })}
        aria-pressed={value.delivery}
        className="border-border bg-card flex w-full items-center justify-between rounded-2xl border p-4"
      >
        <div className="flex items-center gap-3 text-left">
          <Icon name="Truck" className="text-muted-foreground size-5" />
          <div>
            <p className="font-semibold">Delivery channel</p>
            <p className="text-muted-foreground text-sm">
              Adds bad-weather delivery resilience.
            </p>
          </div>
        </div>
        <span
          className={cn(
            "flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors",
            value.delivery ? "bg-primary justify-end" : "bg-muted justify-start",
          )}
        >
          <span className="bg-card size-5 rounded-full shadow" />
        </span>
      </button>
    </div>
  );
}
