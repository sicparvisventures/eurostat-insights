"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/shell/app-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { SectionTitle } from "@/components/business/business-widgets";
import { useBusinessStore } from "@/lib/store/business";

export default function BusinessSettingsPage() {
  const router = useRouter();
  const { profile, updateProfile, resetBusiness } = useBusinessStore();

  return (
    <div>
      <AppHeader
        title="Business settings"
        subtitle="Profile, sources and display"
        homeHref="/business/home"
      />

      <div className="space-y-6 px-5 pt-2">
        <section>
          <SectionTitle icon="Sun" title="Appearance" />
          <Card className="flex items-center justify-between p-4">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </Card>
        </section>

        <section>
          <SectionTitle icon="Store" title="Business profile" />
          <Card className="space-y-4 p-4">
            <label className="block">
              <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                Business name
              </span>
              <input
                value={profile.businessName}
                onChange={(e) =>
                  updateProfile({ businessName: e.target.value })
                }
                className="field-input"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                  City
                </span>
                <input
                  value={profile.city}
                  onChange={(e) => updateProfile({ city: e.target.value })}
                  className="field-input"
                />
              </label>
              <label className="block">
                <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                  District
                </span>
                <input
                  value={profile.districtCode}
                  onChange={(e) =>
                    updateProfile({ districtCode: e.target.value })
                  }
                  className="field-input"
                />
              </label>
              <label className="block">
                <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
                  Country
                </span>
                <input
                  value={profile.country}
                  onChange={(e) =>
                    updateProfile({ country: e.target.value.toUpperCase() })
                  }
                  maxLength={2}
                  className="field-input uppercase"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberSetting
                label="Daily budget"
                value={profile.dailyBudget}
                onChange={(dailyBudget) => updateProfile({ dailyBudget })}
              />
              <NumberSetting
                label="Avg. ticket"
                value={profile.averageTicket}
                onChange={(averageTicket) => updateProfile({ averageTicket })}
              />
              <NumberSetting
                label="Staff h / EUR 1k"
                value={profile.targetStaffHoursPer1000}
                onChange={(targetStaffHoursPer1000) =>
                  updateProfile({ targetStaffHoursPer1000 })
                }
              />
              <NumberSetting
                label="Labor EUR / h"
                value={profile.laborHourCost}
                onChange={(laborHourCost) => updateProfile({ laborHourCost })}
              />
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle icon="Info" title="About Business Mode" />
          <Card className="space-y-2 p-4 text-sm">
            <p className="text-muted-foreground leading-relaxed">
              Business Mode combines open local signals with Eurostat as a
              macro/regional baseline. It avoids social scraping and marks
              credentialed sources until access is configured.
            </p>
            <p className="text-muted-foreground/70 text-xs">
              Source strategy follows the internal hospitality and hotspot
              research docs reviewed on 2026-05-31.
            </p>
          </Card>
        </section>

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

function NumberSetting({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="field-input"
      />
    </label>
  );
}
