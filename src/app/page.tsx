import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { DemoAccess } from "@/components/auth/demo-access";
import { isDemoModeEnabled } from "@/lib/demo";

export default async function Home() {
  const userId = await getCurrentUserId();
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <main className="flex max-w-md flex-col items-center gap-5">
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
        {isDemoModeEnabled() && <DemoAccess />}
      </main>
    </div>
  );
}
