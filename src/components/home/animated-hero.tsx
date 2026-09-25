"use client";

import Link from "next/link";
import Image from "next/image";
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

const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 },
  },
};

export function AnimatedHero({ demoModeEnabled }: { demoModeEnabled: boolean }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    // Statyczna wersja - bez animacji, treść w pełni widoczna od razu.
    return (
      <div className="flex w-full max-w-5xl flex-col items-center gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex w-full max-w-md flex-col items-center gap-5 text-center sm:items-start sm:text-left">
          <TextContent demoModeEnabled={demoModeEnabled} />
        </div>
        <div className="relative w-full max-w-sm sm:max-w-md">
          <PortraitContent />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex w-full max-w-5xl flex-col items-center gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-5 text-center sm:items-start sm:text-left">
        <TextContent demoModeEnabled={demoModeEnabled} animated />
      </div>
      <motion.div variants={imageReveal} className="relative w-full max-w-sm sm:max-w-md">
        <PortraitContent />
      </motion.div>
    </motion.div>
  );
}

function TextContent({ demoModeEnabled, animated }: { demoModeEnabled: boolean; animated?: boolean }) {
  if (!animated) {
    return (
      <>
        <span className="rounded-full border border-[var(--spark-1)]/30 bg-[var(--spark-1)]/10 px-4 py-1 text-xs font-bold uppercase tracking-wide text-[var(--spark-1)]">
          Wersja robocza &middot; MVP w budowie
        </span>
        <h1
          className="text-6xl italic tracking-tight"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            backgroundImage: "linear-gradient(100deg, var(--foreground) 40%, var(--spark-1) 75%, var(--spark-2) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Iskra
        </h1>
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
      <motion.span
        variants={item}
        className="rounded-full border border-[var(--spark-1)]/30 bg-[var(--spark-1)]/10 px-4 py-1 text-xs font-bold uppercase tracking-wide text-[var(--spark-1)]"
      >
        Wersja robocza &middot; MVP w budowie
      </motion.span>
      <motion.h1
        variants={item}
        className="text-6xl italic tracking-tight"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          backgroundImage: "linear-gradient(100deg, var(--foreground) 40%, var(--spark-1) 75%, var(--spark-2) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Iskra
      </motion.h1>
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

function PortraitContent() {
  return (
    <>
      {/* Poświata w kolorach marki za zdjęciem */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] opacity-60 blur-2xl"
        style={{ backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)" }}
      />
      {/* Gradientowa ramka wokół zdjęcia */}
      <div
        className="rounded-2xl p-[2px]"
        style={{ backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)" }}
      >
        <div className="overflow-hidden rounded-[calc(1rem-2px)]">
          <Image
            src="/images/hero-portrait.jpg"
            alt="Uśmiechnięta kobieta, portret - ilustracja strony głównej Iskry"
            width={900}
            height={1140}
            priority
            className="h-auto w-full object-cover"
            sizes="(min-width: 640px) 420px, 90vw"
          />
        </div>
      </div>
      {/* Unoszące się "iskierki" nawiązujące do nazwy aplikacji */}
      <span
        aria-hidden
        className="absolute -top-3 right-8 h-3 w-3 rounded-full"
        style={{ backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)" }}
      />
      <span
        aria-hidden
        className="absolute top-10 -right-2 h-2 w-2 rounded-full opacity-80"
        style={{ backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)" }}
      />
      <span
        aria-hidden
        className="absolute -bottom-2 left-10 h-2.5 w-2.5 rounded-full opacity-70"
        style={{ backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)" }}
      />
    </>
  );
}
