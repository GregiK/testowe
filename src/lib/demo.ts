// Etap 16: tryb demo - podgląd aplikacji bez rejestracji, logowanie na jedno z 5 gotowych
// kont demonstracyjnych. Domyślnie WYŁĄCZONY (patrz isDemoModeEnabled) - włączany wyłącznie
// zmienną środowiskową DEMO_MODE_ENABLED, żeby nikt obcy nie mógł się "zalogować" na
// produkcji bez naszej wiedzy. Uzasadnienie decyzji: docs/assumptions.md (Etap 16).

export type DemoProfileSlug = "anna" | "piotr" | "marta" | "tomasz" | "kasia";

export interface DemoProfile {
  slug: DemoProfileSlug;
  userId: string;
  label: string;
  blurb: string;
}

// userId musi być zgodne z ID wstawionymi przez docs/wdrozenie/iskra-demo-profiles.sql -
// jeśli zmienisz ID tutaj, zaktualizuj też ten plik SQL (i odwrotnie).
export const DEMO_PROFILES: DemoProfile[] = [
  { slug: "anna", userId: "demo-user-anna", label: "Anna, 27 lat", blurb: "Kawa, góry, dobre rozmowy." },
  { slug: "piotr", userId: "demo-user-piotr", label: "Piotr, 29 lat", blurb: "Siłownia, gotowanie, psy." },
  { slug: "marta", userId: "demo-user-marta", label: "Marta, 25 lat", blurb: "Książki, podróże, kino." },
  { slug: "tomasz", userId: "demo-user-tomasz", label: "Tomasz, 31 lat", blurb: "Rower, fotografia, koty." },
  { slug: "kasia", userId: "demo-user-kasia", label: "Kasia, 26 lat", blurb: "Muzyka na żywo, jogging." },
];

export function isDemoModeEnabled(): boolean {
  return process.env.DEMO_MODE_ENABLED === "true";
}

export function findDemoProfile(slug: string): DemoProfile | null {
  return DEMO_PROFILES.find((p) => p.slug === slug) ?? null;
}
