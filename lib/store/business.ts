"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BusinessType =
  | "restaurant"
  | "bar"
  | "cafe"
  | "hotel"
  | "catering"
  | "qsr"
  | "dark-kitchen";

export type PriceTier = "budget" | "casual" | "premium" | "fine";

/** A single restaurant/site. Everything the forecast engine needs. */
export interface LocationConfig {
  id: string;
  name: string;
  city: string;
  country: string; // ISO-2, matches Eurostat geo
  businessType: BusinessType;
  priceTier: PriceTier;
  seats: number;
  terraceSeats: number;
  avgTicket: number; // EUR ex VAT
  /** 0–100: how much of evening trade leans to dinner vs lunch. */
  dinnerFocus: number;
  openDays: number; // days/week 1–7
  laborHourCost: number; // EUR/h
  /** Staffing benchmark: planned staff hours per EUR 1,000 of revenue. */
  targetStaffHoursPer1000: number;
  /** 0–100: how strongly weather/terrace swings demand. */
  weatherSensitivity: number;
  delivery: boolean;
}

export interface BusinessGroup {
  name: string;
  country: string;
}

interface BusinessState {
  onboarded: boolean;
  group: BusinessGroup;
  locations: LocationConfig[];
  activeLocationId: string | null;
  setGroup: (patch: Partial<BusinessGroup>) => void;
  addLocation: (location: LocationConfig) => void;
  updateLocation: (id: string, patch: Partial<LocationConfig>) => void;
  removeLocation: (id: string) => void;
  setActiveLocation: (id: string) => void;
  completeOnboarding: () => void;
  resetBusiness: () => void;
}

export const PRICE_TIER_TICKET: Record<PriceTier, number> = {
  budget: 16,
  casual: 32,
  premium: 52,
  fine: 95,
};

let seq = 0;
function nextId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  seq += 1;
  return `loc-${Date.now()}-${seq}`;
}

/** A sensible blank location to start configuring from. */
export function newLocation(
  patch: Partial<LocationConfig> = {},
): LocationConfig {
  const priceTier = patch.priceTier ?? "casual";
  return {
    id: nextId(),
    name: "",
    city: "Brussels",
    country: "BE",
    businessType: "restaurant",
    priceTier,
    seats: 48,
    terraceSeats: 16,
    avgTicket: PRICE_TIER_TICKET[priceTier],
    dinnerFocus: 58,
    openDays: 6,
    laborHourCost: 23.5,
    targetStaffHoursPer1000: 12.5,
    weatherSensitivity: 55,
    delivery: true,
    ...patch,
  };
}

export const DEFAULT_GROUP: BusinessGroup = { name: "", country: "BE" };

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      onboarded: false,
      group: DEFAULT_GROUP,
      locations: [],
      activeLocationId: null,
      setGroup: (patch) =>
        set((state) => ({ group: { ...state.group, ...patch } })),
      addLocation: (location) =>
        set((state) => ({
          locations: [...state.locations, location],
          activeLocationId: state.activeLocationId ?? location.id,
        })),
      updateLocation: (id, patch) =>
        set((state) => ({
          locations: state.locations.map((l) =>
            l.id === id ? { ...l, ...patch } : l,
          ),
        })),
      removeLocation: (id) =>
        set((state) => {
          const locations = state.locations.filter((l) => l.id !== id);
          return {
            locations,
            activeLocationId:
              state.activeLocationId === id
                ? (locations[0]?.id ?? null)
                : state.activeLocationId,
          };
        }),
      setActiveLocation: (id) => set({ activeLocationId: id }),
      completeOnboarding: () => set({ onboarded: true }),
      resetBusiness: () =>
        set({
          onboarded: false,
          group: DEFAULT_GROUP,
          locations: [],
          activeLocationId: null,
        }),
    }),
    {
      name: "eurostat-business-prefs",
      version: 2,
      // Structure changed in v2; drop any v1 single-profile data.
      migrate: () => ({
        onboarded: false,
        group: DEFAULT_GROUP,
        locations: [],
        activeLocationId: null,
      }),
      partialize: (state) => ({
        onboarded: state.onboarded,
        group: state.group,
        locations: state.locations,
        activeLocationId: state.activeLocationId,
      }),
    },
  ),
);

/** The currently selected location, or the first one. */
export function useActiveLocation(): LocationConfig | null {
  return useBusinessStore((s) => {
    if (!s.locations.length) return null;
    return s.locations.find((l) => l.id === s.activeLocationId) ?? s.locations[0];
  });
}

export function useBusinessHasHydrated() {
  return useSyncExternalStore(
    (onStoreChange) =>
      useBusinessStore.persist.onFinishHydration(onStoreChange),
    () => useBusinessStore.persist.hasHydrated(),
    () => false,
  );
}
