"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/shell/app-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipBar } from "@/components/ui/chip-bar";
import { Icon } from "@/components/ui/icon";
import {
  BusinessTypePicker,
  CitySelect,
  LocationSliders,
} from "@/components/business/location-form";
import { SectionTitle } from "@/components/business/business-widgets";
import { citiesForCountry } from "@/lib/business/cities";
import {
  useActiveLocation,
  useBusinessHasHydrated,
  useBusinessStore,
} from "@/lib/store/business";
import { EU_COUNTRIES } from "@/lib/eurostat/constants";

export default function BusinessSettingsPage() {
  const router = useRouter();
  const hydrated = useBusinessHasHydrated();
  const group = useBusinessStore((s) => s.group);
  const locations = useBusinessStore((s) => s.locations);
  const setGroup = useBusinessStore((s) => s.setGroup);
  const setActive = useBusinessStore((s) => s.setActiveLocation);
  const updateLocation = useBusinessStore((s) => s.updateLocation);
  const duplicateLocation = useBusinessStore((s) => s.duplicateLocation);
  const resetBusiness = useBusinessStore((s) => s.resetBusiness);
  const active = useActiveLocation();

  if (!hydrated) return null;

  return (
    <div>
      <AppHeader
        title="Business settings"
        subtitle="Group, locations and model"
        homeHref="/business/home"
      />

      <div className="space-y-6 px-5 pt-2">
        <section>
          <SectionTitle title="Appearance" />
          <Card className="flex items-center justify-between p-4">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </Card>
        </section>

        <section>
          <SectionTitle title="Group" />
          <Card className="space-y-4 p-4">
            <label className="block">
              <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                Group name
              </span>
              <input
                value={group.name}
                onChange={(e) => setGroup({ name: e.target.value })}
                className="field-input"
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                Country
              </span>
              <select
                value={group.country}
                onChange={(e) => setGroup({ country: e.target.value })}
                className="field-input"
              >
                {EU_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </Card>
        </section>

        {active ? (
          <section>
            <SectionTitle title="Location setup" />
            {locations.length > 1 && (
              <ChipBar
                ariaLabel="Location"
                value={active.id}
                onChange={setActive}
                className="mb-3"
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
              />
            )}
            <Card className="space-y-5 p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                    Name
                  </span>
                  <input
                    value={active.name}
                    onChange={(e) =>
                      updateLocation(active.id, { name: e.target.value })
                    }
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                    Country
                  </span>
                  <select
                    value={active.country}
                    onChange={(e) =>
                      updateLocation(active.id, {
                        country: e.target.value,
                        city: citiesForCountry(e.target.value)[0],
                      })
                    }
                    className="field-input"
                  >
                    {EU_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                    City
                  </span>
                  <CitySelect
                    country={active.country}
                    value={active.city}
                    onChange={(city) => updateLocation(active.id, { city })}
                  />
                </label>
              </div>
              <BusinessTypePicker
                value={active.businessType}
                onChange={(businessType) =>
                  updateLocation(active.id, { businessType })
                }
              />
              <LocationSliders
                value={active}
                onChange={(patch) => updateLocation(active.id, patch)}
              />
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => duplicateLocation(active.id)}
              >
                <Icon name="Layers" /> Duplicate this location
              </Button>
            </Card>
          </section>
        ) : (
          <Card className="p-5 text-center">
            <p className="text-muted-foreground text-sm">
              No location yet.
            </p>
            <Button asChild className="mt-3">
              <Link href="/business/onboarding">Set up</Link>
            </Button>
          </Card>
        )}

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            resetBusiness();
            router.push("/business/onboarding");
          }}
        >
          <Icon name="RefreshCw" /> Reset Business Mode
        </Button>
      </div>
    </div>
  );
}
