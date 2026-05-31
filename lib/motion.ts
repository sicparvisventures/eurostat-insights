import type { Variants } from "framer-motion";

/** Shared easing curve (typed as a cubic-bezier tuple for framer-motion). */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.5, ease: EASE_OUT },
  }),
};
