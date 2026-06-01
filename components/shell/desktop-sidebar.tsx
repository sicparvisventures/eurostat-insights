"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Home", icon: "Home" },
  { href: "/topics", label: "Topics", icon: "LayoutGrid" },
  { href: "/explore", label: "Explore", icon: "Compass" },
  { href: "/settings", label: "Settings", icon: "Settings" },
];

/**
 * Desktop-only left rail. Shares the bottom tab bar's visual language (floating
 * card, blur, morphing primary pill) and collapses to an icon-only strip with
 * hover labels.
 */
export function DesktopSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden p-3 lg:block",
        "transition-[width] duration-300 ease-out",
        collapsed ? "w-[88px]" : "w-[248px]",
      )}
    >
      <div className="border-border/60 bg-card/80 flex h-full flex-col rounded-[26px] border p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {/* Brand */}
        <Link
          href="/home"
          aria-label="Eurostat Insights — Home"
          className={cn(
            "flex items-center gap-2.5 rounded-2xl px-2 py-1.5",
            collapsed && "justify-center px-0",
          )}
        >
          <Logo size={34} />
          {!collapsed && (
            <span className="truncate text-[15px] font-semibold tracking-tight">
              Eurostat Insights
            </span>
          )}
        </Link>

        {/* Nav */}
        <nav aria-label="Primary" className="mt-4 flex flex-1 flex-col gap-1.5">
          {TABS.map((tab) => {
            const active =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? tab.label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                  collapsed && "justify-center px-0",
                  !active && "hover:bg-muted/60",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="bg-primary/12 absolute inset-0 rounded-2xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  name={tab.icon}
                  className={cn(
                    "relative size-5 shrink-0 transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {!collapsed && (
                  <span
                    className={cn(
                      "relative text-sm font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {tab.label}
                  </span>
                )}

                {/* Hover label when collapsed */}
                {collapsed && (
                  <span className="bg-foreground text-background pointer-events-none absolute left-full ml-2 z-50 hidden whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100">
                    {tab.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer: theme + collapse toggle */}
        <div
          className={cn(
            "mt-2 flex items-center gap-2",
            collapsed ? "flex-col" : "justify-between",
          )}
        >
          {!collapsed && <ThemeToggle />}
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-full transition-colors"
          >
            <Icon
              name={collapsed ? "ChevronRight" : "ChevronLeft"}
              className="size-5"
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
