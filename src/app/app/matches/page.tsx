import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dopasowania - Iskra",
};

export default async function MatchesPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const matches = await prisma.match.findMany({
    where: { unmatchedAt: null, OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      userA: { select: { id: true, profile: { select: { displayName: true } } } },
      userB: { select: { id: true, profile: { select: { displayName: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[var(--foreground)]">Twoje dopasowania</h1>
          <a href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Wróć
          </a>
        </div>

        {matches.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
            <span className="text-4xl">💬</span>
            <h2 className="text-base font-bold text-[var(--foreground)]">Brak dopasowań</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Gdy Ty i ktoś inny polubicie się nawzajem, pojawi się tutaj.
            </p>
            <a
              href="/app/discovery"
              className="mt-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
            >
              Odkrywaj profile
            </a>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {matches.map((m) => {
              const other = m.userAId === userId ? m.userB : m.userA;
              const name = other.profile?.displayName ?? "Użytkownik";
              const last = m.messages[0];
              return (
                <li key={m.id}>
                  <a
                    href={`/app/matches/${m.id}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition hover:border-[var(--spark-1)]/50"
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
                      aria-hidden="true"
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {name}
                      </p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {last ? last.body : "Napisz pierwszą wiadomość"}
                      </p>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
