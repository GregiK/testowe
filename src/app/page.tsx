export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white px-6 text-center dark:from-zinc-950 dark:to-black">
      <main className="flex max-w-xl flex-col items-center gap-6">
        <span className="rounded-full bg-rose-100 px-4 py-1 text-sm font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          Wersja robocza - MVP w budowie
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Iskra
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Robocza nazwa i identyfikacja aplikacji randkowej (Polska/UE). Ten ekran to
          punkt startowy - właściwe funkcje (rejestracja, discovery, dopasowania, czat)
          powstają etapami zgodnie z <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm dark:bg-white/10">docs/implementation-plan.md</code>.
        </p>
      </main>
    </div>
  );
}
