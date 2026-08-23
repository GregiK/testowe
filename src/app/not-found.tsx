export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <span className="text-5xl">🔍</span>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Nie znaleziono strony</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Strona, której szukasz, nie istnieje albo została przeniesiona.
        </p>
        <a
          href="/app"
          className="w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition"
          style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
        >
          Wróć do aplikacji
        </a>
      </div>
    </div>
  );
}
