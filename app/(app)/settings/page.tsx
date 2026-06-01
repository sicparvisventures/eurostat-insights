"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/shell/app-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { CountryChips } from "@/components/country-chips";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TOPICS } from "@/lib/eurostat/registry";
import {
  usePersonalization,
  type TopicSlug,
} from "@/lib/store/personalization";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const {
    name,
    setName,
    country,
    setCountry,
    interests,
    toggleInterest,
    reset,
  } = usePersonalization();

  return (
    <div>
      <AppHeader title="Settings" subtitle="Personalise your experience" />
      <div className="space-y-6 px-5 pt-2">
        {/* Appearance */}
        <Section title="Appearance" icon="Sun">
          <Row label="Theme">
            <ThemeToggle />
          </Row>
        </Section>

        {/* Profile */}
        <Section title="Profile" icon="Users">
          <div className="p-4">
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="border-border bg-background focus:border-primary w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="border-border border-t p-4">
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Home country / region
            </p>
            <CountryChips value={country} onChange={setCountry} />
          </div>
        </Section>

        {/* Interests */}
        <Section title="Interests" icon="LayoutGrid">
          <div className="space-y-2 p-4">
            {TOPICS.map((t) => {
              const active = interests.includes(t.slug as TopicSlug);
              return (
                <button
                  key={t.slug}
                  onClick={() => toggleInterest(t.slug as TopicSlug)}
                  className="flex w-full items-center gap-3"
                >
                  <div
                    className="flex size-9 items-center justify-center rounded-lg text-white"
                    style={{ background: t.accent }}
                  >
                    <Icon name={t.icon} className="size-4" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium">
                    {t.title}
                  </span>
                  <span
                    className={cn(
                      "flex h-6 w-10 items-center rounded-full p-0.5 transition-colors",
                      active ? "bg-primary justify-end" : "bg-muted justify-start",
                    )}
                  >
                    <span className="bg-card size-5 rounded-full shadow" />
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* About */}
        <Section title="About" icon="Info">
          <div className="space-y-2 p-4 text-sm">
            <p className="text-muted-foreground leading-relaxed">
              Statera is an educational project for entertainment. All
              figures come exclusively from{" "}
              <a
                href="https://ec.europa.eu/eurostat"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Eurostat
              </a>
              , the statistical office of the European Union.
            </p>
            <p className="text-muted-foreground/70 text-xs">
              © European Union, 1995–{new Date().getFullYear()}. Eurostat data
              is reused under the EU open-data policy.
            </p>
          </div>
        </Section>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            reset();
            router.push("/");
          }}
        >
          <Icon name="RefreshCw" /> Reset & restart onboarding
        </Button>

        <p className="text-muted-foreground/50 pb-2 text-center text-xs">
          Version 1.0 · Made with Eurostat open data
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 px-1">
        <Icon name={icon} className="text-primary size-4" />
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      <Card className="overflow-hidden p-0">{children}</Card>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
