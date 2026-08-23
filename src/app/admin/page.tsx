import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdminUserId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ReportRowActions } from "@/components/admin/report-row-actions";

export const metadata: Metadata = {
  title: "Panel administratora - Iskra",
};

export default async function AdminPage() {
  const adminUserId = await getCurrentAdminUserId();
  if (!adminUserId) {
    // Nie ujawniamy, że strona w ogóle istnieje dla kont bez uprawnień - traktujemy jak
    // nieistniejącą trasę zamiast np. komunikatu "brak dostępu".
    redirect("/app");
  }

  const [userCount, matchCount, openReportsCount, reports] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.match.count({ where: { unmatchedAt: null } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.report.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        reporter: { select: { email: true, profile: { select: { displayName: true } } } },
        target: { select: { email: true, profile: { select: { displayName: true } } } },
      },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[var(--foreground)]">Panel administratora</h1>
          <a href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Wróć do aplikacji
          </a>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{userCount}</p>
            <p className="text-xs text-[var(--muted)]">Użytkownicy</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{matchCount}</p>
            <p className="text-xs text-[var(--muted)]">Aktywne dopasowania</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--danger)]">{openReportsCount}</p>
            <p className="text-xs text-[var(--muted)]">Zgłoszenia do rozpatrzenia</p>
          </div>
        </div>

        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          Kolejka zgłoszeń
        </h2>

        {reports.length === 0 ? (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">
            Brak zgłoszeń oczekujących na rozpatrzenie.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-[var(--foreground)]">
                    <strong>{r.reporter.profile?.displayName ?? r.reporter.email}</strong> zgłasza{" "}
                    <strong>{r.target.profile?.displayName ?? r.target.email}</strong>
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(r.createdAt).toLocaleString("pl-PL")}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)]">{r.reason}</p>
                <ReportRowActions reportId={r.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
