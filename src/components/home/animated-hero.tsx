"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { DemoAccess } from "@/components/auth/demo-access";

// Etap 18: "kinowe" wejście treści na stronie głównej (Framer Motion) - elementy pojawiają
// się sekwencyjnie (stagger), zamiast wszystkie naraz. Czysto kosmetyczne - logika (redirect
// zalogowanego usera, sprawdzenie trybu demo) zostaje w src/app/page.tsx (Server Component);
// ten plik jest Client Component wyłącznie dlatego, że framer-motion wymaga JS w przeglądarce.
// Animujemy bezpośrednio na docelowych tagach (motion.h1, motion.p, ...) zamiast owijać je
// dodatkowym display:contents divem - transform/opacity na display:contents zachowuje się
// niespójnie między przeglądarkami. Respektujemy prefers-reduced-motion (useReducedMotion) -
// wtedy treść jest od razu w pełni widoczna, bez animacji.
//
// Etap 24: logo "Iskra" (h1) i odznaka "Wersja robocza" przeniesione na kinowy baner
// (CinematicAuthBackground, jako children - patrz src/app/page.tsx), spójnie z tym co
// zrobiliśmy na /login i /register w Etapie 23. Osobne, statyczne zdjęcie portretowe
// (dawny PortraitContent, to samo zdjęcie co w banerze) zostało usunięte jako zbędne
// powielenie tej samej fotografii na jednej stronie - layout jest teraz jednokolumnowy,
// wyśrodkowany, zamiast dwóch kolumn tekst+zdjęcie.

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function AnimatedHero({ demoModeEnabled }: { demoModeEnabled: boolean }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    // Statyczna wersja - bez animacji, treść w pełni widoczna od razu.
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center">
        <TextContent demoModeEnabled={demoModeEnabled} />
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <TextContent demoModeEnabled={demoModeEnabled} animated />
    </motion.div>
  );
}

function TextContent({ demoModeEnabled, animated }: { demoModeEnabled: boolean; animated?: boolean }) {
  if (!animated) {
    return (
      <>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Prawdziwe rozmowy, nie przewijanie w nieskończoność. Legalna, bezpieczna
          aplikacja randkowa budowana od podstaw dla Polski i UE, 18+.
        </p>
        <div className="mt-2 flex w-full flex-col gap-3">
          <Link
            href="/register"
            className="w-full rounded-xl px-4 py-3 text-center text-sm font-bold text-[#1b1520] transition hover:brightness-105"
            style={{ backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)" }}
          >
            Załóż konto
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--spark-2)]/50"
          >
            Mam już konto
          </Link>
        </div>
        <span className="mt-4 text-[11px] tracking-wide text-[var(--muted)]/70">
          Weryfikacja wieku &middot; zgodność z RODO
        </span>
        {demoModeEnabled && <DemoAccess />}
      </>
    );
  }

  return (
    <>
      <motion.p variants={item} className="text-sm leading-6 text-[var(--muted)]">
        Prawdziwe rozmowy, nie przewijanie w nieskończoność. Legalna, bezpieczna
        aplikacja randkowa budowana od podstaw dla Polski i UE, 18+.
      </motion.p>
      <motion.div variants={item} className="mt-2 flex w-full flex-col gap-3">
        <Link
          href="/register"
          className="w-full rounded-xl px-4 py-3 text-center text-sm font-bold text-[#1b1520] transition hover:brightness-105"
          style={{ backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)" }}
        >
          Załóż konto
        </Link>
        <Link
          href="/login"
          className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--spark-2)]/50"
        >
          Mam już konto
        </Link>
      </motion.div>
      <motion.span variants={item} className="mt-4 text-[11px] tracking-wide text-[var(--muted)]/70">
        Weryfikacja wieku &middot; zgodność z RODO
      </motion.span>
      {demoModeEnabled && (
        <motion.div variants={item} className="w-full">
          <DemoAccess />
        </motion.div>
      )}
    </>
  );
}
