"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Etap 19: wejście karty formularza (fade + lekkie unoszenie/skalowanie) nad kinowym tłem
// (CinematicAuthBackground). Karta ma półprzezroczyste tło + blur, żeby tekst formularza
// pozostał czytelny nad ruchomym zdjęciem w tle.
export function AuthCardReveal({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)]/70 p-6 shadow-2xl backdrop-blur-md sm:p-8"
    >
      {children}
    </motion.div>
  );
}
