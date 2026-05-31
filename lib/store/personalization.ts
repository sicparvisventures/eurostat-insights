"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TopicSlug = "population" | "economy" | "digital" | "hospitality";

interface PersonalizationState {
  onboarded: boolean;
  name: string;
  /** Topics the user is interested in (drives the personalized home). */
  interests: TopicSlug[];
  /** Preferred country code (Eurostat geo). */
  country: string;
  /** Favourite metric ids, pinned to home. */
  favorites: string[];

  setName: (name: string) => void;
  toggleInterest: (slug: TopicSlug) => void;
  setInterests: (slugs: TopicSlug[]) => void;
  setCountry: (code: string) => void;
  toggleFavorite: (metricId: string) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

const DEFAULTS = {
  onboarded: false,
  name: "",
  interests: ["population", "economy", "digital", "hospitality"] as TopicSlug[],
  country: "EU27_2020",
  favorites: [] as string[],
};

export const usePersonalization = create<PersonalizationState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setName: (name) => set({ name }),
      toggleInterest: (slug) =>
        set((s) => ({
          interests: s.interests.includes(slug)
            ? s.interests.filter((i) => i !== slug)
            : [...s.interests, slug],
        })),
      setInterests: (interests) => set({ interests }),
      setCountry: (country) => set({ country }),
      toggleFavorite: (metricId) =>
        set((s) => ({
          favorites: s.favorites.includes(metricId)
            ? s.favorites.filter((f) => f !== metricId)
            : [...s.favorites, metricId],
        })),
      completeOnboarding: () => set({ onboarded: true }),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: "eurostat-insights-prefs",
      version: 1,
    },
  ),
);

/** Avoids hydration mismatch: returns false until the store has hydrated. */
export function useHasHydrated() {
  return useSyncExternalStore(
    (onStoreChange) =>
      usePersonalization.persist.onFinishHydration(onStoreChange),
    () => usePersonalization.persist.hasHydrated(),
    () => false,
  );
}
