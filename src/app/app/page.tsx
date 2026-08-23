import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Iskra",
};

export default async function AppHome() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      email: true,
      profile: { select: { displayName: true } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const name = user.profile?.displayName ?? user.email;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <span className="rounded-full border border-[var(--spark-1)]/30 bg-[var(--spark-1)]/10 px-4 py-1 text-xs font-bold uppercase tracking-wide text-[var(--spark-1)]">
          Zalogowano
        </span>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Cześć, {name}! 👋</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Twoje konto i sesja działają poprawnie. Kolejne etapy (zdjęcia) powstają zgodnie
          z planem wdrożenia.
        </p>
        <a
          href="/app/discovery"
          className="w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition"
          style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
        >
          Odkrywaj profile
        </a>
        <a
          href="/app/matches"
          className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--spark-1)]/50"
        >
          Twoje dopasowania
        </a>
        <a
          href="/app/profil"
          className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--spark-1)]/50"
        >
          Uzupełnij profil
        </a>
        <form action={logoutAction} className="mt-2 w-full">
          <button
            type="submit"
            className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--danger)]/50"
          >
            Wyloguj się
          </button>
        </form>
      </div>
    </div>
  );
}
