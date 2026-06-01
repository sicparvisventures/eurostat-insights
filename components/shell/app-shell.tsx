"use client";

import { useSyncExternalStore } from "react";
import { BottomTabBar } from "@/components/shell/bottom-tab-bar";
import { DesktopSidebar } from "@/components/shell/desktop-sidebar";
import { PageTransition } from "@/components/shell/page-transition";
import { SplashScreen } from "@/components/shell/splash-screen";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ei-sidebar-collapsed";

// Tiny external store so the persisted flag reads correctly on first paint
// without a setState-in-effect or hydration mismatch.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}
function setCollapsed(value: boolean) {
  localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  listeners.forEach((l) => l());
}

/**
 * Responsive app frame: a floating bottom tab bar on mobile and a collapsible
 * left rail on desktop, with the content column reflowing to fit the rail.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false,
  );

  return (
    <div className="min-h-dvh">
      <SplashScreen />
      <DesktopSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div
        className={cn(
          "min-h-dvh transition-[padding] duration-300 ease-out",
          collapsed ? "lg:pl-[88px]" : "lg:pl-[248px]",
        )}
      >
        <main className="mx-auto w-full max-w-2xl pb-28 lg:max-w-5xl lg:px-6 lg:pb-12">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
}
