"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// Etap 21: poprzednia wersja (Etap 19/20) byla za subtelna - zdjecie mialo opacity 45%
// i bylo dodatkowo przycmione ciezka winieta, wiec na mobile (gdzie karta formularza
// zajmuje niemal caly ekran) efekt byl praktycznie niewidoczny. Uzytkownik chcial
// wyrazny, "kinowy" efekt przypominajacy krotki, zapetlony filmik z kobieta w kawiarni.
//
// Zmiany:
// - To juz nie jest "fixed inset-0" tlo calej strony, tylko WIDOCZNY pasek/baner w
//   normalnym ukladzie strony, nad tytulem/formularzem - wiec zawsze zajmuje realna
//   przestrzen na ekranie (szczegolnie wazne na mobile).
// - Na mobile jest "pelnoekranowy" (edge-to-edge, wychodzi poza padding kontenera),
//   wysoki (48% wysokosci ekranu) - to glowny, natychmiast widoczny "wow" element.
//   Na sm+ (tablet/desktop) staje sie zaokraglona karta o szerokosci kontenera.
// - Zdjecie ma teraz pelna widocznosc (bez przycmienia opacity), z delikatnym
//   gradientowym przejsciem na dole do koloru tla (zamiast pelnej ciemnej winiety),
//   zeby tekst pod spodem zostal czytelny, ale samo zdjecie bylo mocne i wyrazne.
// - Animacja Ken Burnsa (powolny zoom + pan w petli) jest teraz bardziej zauwazalna
//   (krotszy cykl, wiekszy zakres przesuniecia) - ma dawac wrazenie "zywego kadru"/
//   petli wideo, a nie ledwo dostrzegalnego ruchu w tle.
//
// Nadal nie jest to prawdziwy plik wideo (brak w tym srodowisku narzedzia do
// generowania/pobierania wideo) - to animowane zdjecie dajace podobny efekt "wow".
// Respektujemy prefers-reduced-motion - wtedy zdjecie jest statyczne.

const PARTICLES = [
  { left: "10%", size: 10, duration: 8, delay: 0 },
  { left: "22%", size: 6, duration: 10, delay: 1 },
  { left: "36%", size: 8, duration: 9, delay: 2 },
  { left: "50%", size: 5, duration: 11, delay: 0.5 },
  { left: "64%", size: 9, duration: 9.5, delay: 2.6 },
  { left: "78%", size: 6, duration: 12, delay: 1.6 },
  { left: "90%", size: 7, duration: 10.5, delay: 2.2 },
];

// Etap 23: napisy (logo "Iskra", tytuł strony) przenoszą się NA baner ze zdjęciem
// (nakładka na dole banera z mocniejszym przyciemnieniem dla czytelności), zamiast
// stać osobno na czarnym tle pod spodem - to właśnie "napisy mają być ogólnie w tle"
// z prośby użytkownika. `children` renderuje się jako nakładka przy dolnej krawędzi
// banera; strony przekazują tam swój blok tytułowy zamiast renderować go osobno.
export function CinematicAuthBackground({ children }: { children?: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="relative left-1/2 -mx-6 -mt-10 h-[48vh] max-h-[520px] min-h-[300px] w-screen -translate-x-1/2 overflow-hidden bg-[var(--background)] sm:left-auto sm:mx-0 sm:mt-0 sm:h-80 sm:w-full sm:max-h-none sm:translate-x-0 sm:rounded-3xl"
    >
      {/* Zdjecie z zauwazalnym efektem Kena Burnsa (zoom + pan w petli) - pelna
          widocznosc, bez przycmienia, zeby dawac wrazenie "zywego kadru". */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06, x: 0, y: 0 }}
        animate={
          reduceMotion
            ? { scale: 1.06 }
            : {
                scale: [1.06, 1.18, 1.06],
                x: [0, -26, 0],
                y: [0, -10, 0],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 16, ease: "easeInOut", repeat: Infinity }
        }
      >
        <Image
          src="/images/hero-portrait.jpg"
          alt="Kobieta siedząca przy stoliku z filiżanką kawy - kinowy motyw Iskry"
          fill
          priority
          className="object-cover object-[center_18%]"
          sizes="100vw"
        />
      </motion.div>

      {/* Przejscie na dole (i gorze) do koloru tla - dla plynnego polaczenia z reszta
          strony. Dolna czesc jest teraz mocniej przyciemniona (od 40% zamiast 62%),
          bo to wlasnie tam nakladamy tytul (patrz "children" nizej) - potrzebuje
          solidnego kontrastu pod tekstem, gorna czesc zdjecia zostaje w pelni wyrazna. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 40%, var(--background) 96%), linear-gradient(0deg, transparent 88%, var(--background) 100%)",
        }}
      />
      {/* Delikatna poswiata w kolorach marki - dla spojnosci, ale nie przytlacza zdjecia */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{ background: "linear-gradient(135deg, var(--spark-1), transparent 55%, var(--spark-2))" }}
      />

      {/* Unoszace sie "iskierki" */}
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
              boxShadow: "0 0 6px var(--spark-1)",
            }}
            animate={{ y: ["0%", "-340%"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

      {/* Subtelne ziarno filmowe (SVG noise), dla klimatu kinowej retrospekcji */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]">
        <filter id="filmGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#filmGrain)" />
      </svg>

      {/* Cienka ramka w kolorach marki - "kinowy kadr" (widoczna tylko na sm+, gdzie
          element jest zaokraglona karta, nie pelnoekranowy pasek) */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block sm:rounded-3xl sm:ring-1 sm:ring-inset sm:ring-[var(--spark-1)]/25" />

      {/* Etap 23: nakladka z tytulem strony (logo "Iskra", naglowek) - renderuje sie
          NA zdjeciu, przy dolnej krawedzi banera, w obszarze mocno przyciemnionym
          przez gradient powyzej. z-10, zeby byc nad ziarnem/iskierkami/ramka. */}
      {children && (
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-5 text-center sm:px-8 sm:pb-6">
          {children}
        </div>
      )}
    </div>
  );
}
