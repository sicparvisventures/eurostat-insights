"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const SESSION_KEY = "ei-splash-shown";

/** Branded splash overlay shown once per session on first load. */
export function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const hideTimer = window.setTimeout(() => setVisible(false), 1500);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center"
          style={{ background: "#283142" }}
        >
          <motion.svg
            width={72}
            height={72}
            viewBox="0 0 48 48"
            initial={{ scale: 0.6, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
            fill="#fff"
          >
            <rect x="12" y="27" width="5" height="9" rx="1" fillOpacity="0.6" />
            <rect x="21.5" y="20" width="5" height="16" rx="1" fillOpacity="0.8" />
            <rect x="31" y="13" width="5" height="23" rx="1" />
          </motion.svg>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-5 text-center"
          >
            <p className="text-xl font-bold tracking-tight text-white">
              {BRAND_NAME}
            </p>
            <p className="mt-1 text-sm text-white/55">{BRAND_TAGLINE}</p>
          </motion.div>
          <motion.div
            className="absolute bottom-16 h-1 w-28 overflow-hidden rounded-full bg-white/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full w-full rounded-full bg-white/80"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
