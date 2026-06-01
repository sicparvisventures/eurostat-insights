"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Home", icon: "Home" },
  { href: "/topics", label: "Topics", icon: "LayoutGrid" },
  { href: "/explore", label: "Explore", icon: "Compass" },
  { href: "/settings", label: "Settings", icon: "Settings" },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center lg:hidden"
    >
      <div className="pointer-events-auto mx-4 mb-2 flex w-full max-w-md items-center justify-around rounded-[26px] border border-border/60 bg-card/80 px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="bg-primary/12 absolute inset-0 rounded-2xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                name={tab.icon}
                className={cn(
                  "relative size-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "relative text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
