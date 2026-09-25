const buttonClass =
  "flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--spark-2)]/50";

// Linki zwykłe (nie fetch) - kliknięcie ma po prostu przenieść na endpoint /start, który
// odpowiada przekierowaniem 302 do dostawcy. Żaden JS po stronie klienta nie jest potrzebny,
// więc komponent nie musi być "use client".
export function OAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted)]">
        <span className="h-px flex-1 bg-[var(--border)]" />
        lub
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <a href="/api/auth/oauth/google/start" className={buttonClass}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18Z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33Z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
          />
        </svg>
        Kontynuuj przez Google
      </a>

      <a href="/api/auth/oauth/facebook/start" className={buttonClass}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#1877F2"
            d="M18 9a9 9 0 1 0-10.4 8.89v-6.29H5.31V9h2.29V7.02c0-2.26 1.35-3.5 3.41-3.5.99 0 2.02.18 2.02.18v2.22h-1.14c-1.12 0-1.47.7-1.47 1.41V9h2.5l-.4 2.6h-2.1v6.29A9 9 0 0 0 18 9Z"
          />
        </svg>
        Kontynuuj przez Facebook
      </a>
    </div>
  );
}
