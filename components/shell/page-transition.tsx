"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { EASE_OUT } from "@/lib/motion";

/** Subtle fade/slide on route change for a native, app-like feel. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
