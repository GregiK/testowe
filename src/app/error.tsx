"use client";

import { useEffect } from "react";

// Error Boundary dla segmentów aplikacji (Next.js App Router). Wyświetla przyjazny
// komunikat zamiast białego ekranu/stack trace'a - użytkownik nigdy nie widzi
// szczegółów technicznych błędu (mogłyby zdradzić informacje o wewnętrznej strukturze).
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logowanie po stronie klienta trafia do konsoli przeglądarki użytkownika, nie na
    // serwer - błędy serwerowe są już logowane przez logError w poszczególnych route'ach.
    console.error("client_error_boundary", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <span className="text-5xl">⚠️</span>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Coś poszło nie tak</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Wystąpił nieoczekiwany błąd. Spróbuj ponownie - jeśli problem się powtarza, daj
          nam znać.
        </p>
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition"
          style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
}
