"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// Etap 19: "kinowy" efekt tła na stronach logowania/rejestracji - że zdjęcie z hero (Twoja
// kobieta w kawiarni, ta sama co na stronie głównej) w tle formularza, z powolnym efektem
// Kena Burnsa (delikatny zoom + przesunięcie w pętli, jak w filmowych retrospekcjach),
// unoszącymi się "iskierkami" w kolorach marki i subtelnym ziarnem filmowym. Nie jest to
// prawdziwy plik wideo (brak w tym środowisku narzędzia do generowania/pobierania wideo) -
// to animowane, "żywe" zdjęcie, które daje podobny efekt "wow" bez dodatkowych plików do
// pobrania przez użytkownika i bez ryzyka licencyjnego nowego materiału.
//
// Respektujemy prefers-reduced-motion - wtedy zdjęcie jest statyczne (bez zoomu/driftu),
// iskierki i ziarno też się nie poruszają.

const PARTICLES = [
  { left: "12%", size: 10, duration: 9, delay: 0 },
  { left: "24%", size: 6, duration: 12, delay: 1.2 },
  { left: "38%", size: 8, duration: 10, delay: 2.4 },
  { left: "52%", size: 5, duration: 13, delay: 0.6 },
  { left: "66%", size: 9, duration: 11, delay: 3 },
  { left: "78%", size: 6, duration: 14, delay: 1.8 },
  { left: "88%", size: 7, duration: 10.5, delay: 2.9 },
];

export function CinematicAuthBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[var(--background)]" aria-hidden="true">
      {/* Zdjęcie w tle z powolnym efektem Kena Burnsa (zoom + pan w pętli) */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, x: 0, y: 0 }}
        animate={
          reduceMotion
            ? { scale: 1.08 }
            : {
                scale: [1.08, 1.18, 1.08],
                x: [0, -18, 0],
                y: [0, -12, 0],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 26, ease: "easeInOut", repeat: Infinity }
        }
      >
        <Image
          src="/images/hero-portrait.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[center_20%] opacity-45"
          sizes="100vw"
        />
      </motion.div>

      {/* Przyciemnienie + winieta - czytelność formularza nad zdjęciem */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, var(--background) 78%), linear-gradient(180deg, var(--background) 0%, transparent 22%, transparent 70%, var(--background) 100%)",
        }}
      />
      {/* Delikatna poświata w kolorach marki */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{ background: "linear-gradient(135deg, var(--spark-1), transparent 55%, var(--spark-2))" }}
      />

      {/* Unoszące się "iskierki" */}
      {!reduceMotion &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute bottom-[-5%] rounded-full"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)",
              filter: "blur(0.5px)",
            }}
            animate={{ y: ["0vh", "-105vh"], opacity: [0, 0.9, 0.9, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

      {/* Subtelne ziarno filmowe (SVG noise), dla klimatu kinowej retrospekcji */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]">
        <filter id="filmGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#filmGrain)" />
      </svg>
    </div>
  );
}
