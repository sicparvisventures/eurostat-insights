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

export type ForecastGoal =
  | "revenue"
  | "covers"
  | "staff"
  | "stock"
  | "marketing";

export interface BusinessProfile {
  businessName: string;
  businessType: BusinessType;
  cuisine: string;
  priceTier: "budget" | "casual" | "premium" | "fine";
  address: string;
  city: string;
  country: string;
  seats: number;
  terraceSeats: number;
  averageTicket: number;
  dailyBudget: number;
  districtCode: string;
  targetStaffHoursPer1000: number;
  laborHourCost: number;
  delivery: boolean;
  chainMode: "single" | "multi";
  goals: ForecastGoal[];
  connectedSources: string[];
}

interface BusinessState {
  onboarded: boolean;
  profile: BusinessProfile;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  toggleGoal: (goal: ForecastGoal) => void;
  toggleSource: (source: string) => void;
  completeOnboarding: () => void;
  resetBusiness: () => void;
}

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: "",
  businessType: "restaurant",
  cuisine: "",
  priceTier: "casual",
  address: "",
  city: "Brussels",
  country: "BE",
  seats: 48,
  terraceSeats: 16,
  averageTicket: 32,
  dailyBudget: 14289,
  districtCode: "Gent district",
  targetStaffHoursPer1000: 12.5,
  laborHourCost: 23.5,
  delivery: true,
  chainMode: "single",
  goals: ["covers", "staff", "stock"],
  connectedSources: ["weather", "osm", "eurostat", "holidays", "transport"],
};

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      onboarded: false,
      profile: DEFAULT_PROFILE,
      updateProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),
      toggleGoal: (goal) =>
        set((state) => ({
          profile: {
            ...state.profile,
            goals: state.profile.goals.includes(goal)
              ? state.profile.goals.filter((g) => g !== goal)
              : [...state.profile.goals, goal],
          },
        })),
      toggleSource: (source) =>
        set((state) => ({
          profile: {
            ...state.profile,
            connectedSources: state.profile.connectedSources.includes(source)
              ? state.profile.connectedSources.filter((s) => s !== source)
              : [...state.profile.connectedSources, source],
          },
        })),
      completeOnboarding: () => set({ onboarded: true }),
      resetBusiness: () =>
        set({ onboarded: false, profile: DEFAULT_PROFILE }),
    }),
    {
      name: "eurostat-business-prefs",
      version: 1,
    },
  ),
);

export function useBusinessHasHydrated() {
  return useSyncExternalStore(
    (onStoreChange) =>
      useBusinessStore.persist.onFinishHydration(onStoreChange),
    () => useBusinessStore.persist.hasHydrated(),
    () => false,
  );
}
