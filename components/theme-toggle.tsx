"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", icon: "Sun", label: "Light" },
  { value: "system", icon: "Laptop", label: "System" },
  { value: "dark", icon: "Moon", label: "Dark" },
] as const;

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="bg-muted inline-flex items-center gap-1 rounded-full p-1"
    >
      {OPTIONS.map((opt) => {
        const active = mounted && theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon name={opt.icon} className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
