"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SafetyMenu({
  targetUserId,
  targetName,
  onBlocked,
  redirectOnBlockTo,
}: {
  targetUserId: string;
  targetName: string;
  onBlocked?: () => void;
  // Ścieżka do przekierowania po zablokowaniu - używana zamiast onBlocked, gdy komponent
  // jest osadzony z poziomu Server Component (funkcji nie da się przekazać jako props).
  redirectOnBlockTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBlock() {
    const confirmed = window.confirm(
      `Zablokować ${targetName}? Zakończy to wasze dopasowanie i ${targetName} nie będzie mógł/mogła się z Tobą kontaktować.`,
    );
    if (!confirmed) return;

    setBusy(true);
    const res = await fetch(`/api/users/${targetUserId}/block`, { method: "POST" });
    setBusy(false);
    setOpen(false);

    if (res.ok) {
      onBlocked?.();
      if (redirectOnBlockTo) router.push(redirectOnBlockTo);
    } else {
      setMessage("Nie udało się zablokować. Spróbuj ponownie.");
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setMessage("Podaj krótki powód zgłoszenia (min. 5 znaków).");
      return;
    }

    setBusy(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, reason: reason.trim() }),
    });
    setBusy(false);

    if (res.ok) {
      setReportOpen(false);
      setOpen(false);
      setReason("");
      setMessage("Zgłoszenie zostało wysłane. Dziękujemy.");
    } else {
      setMessage("Nie udało się wysłać zgłoszenia. Spróbuj ponownie.");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Więcej opcji"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
      >
        ⋯
      </button>

      {open && !reportOpen && (
        <div className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          <button
            type="button"
            disabled={busy}
            onClick={() => setReportOpen(true)}
            className="block w-full px-4 py-2.5 text-left text-sm text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
          >
            🚩 Zgłoś
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleBlock}
            className="block w-full px-4 py-2.5 text-left text-sm text-[var(--danger)] transition hover:bg-[var(--surface-2)]"
          >
            🚫 Zablokuj
          </button>
        </div>
      )}

      {reportOpen && (
        <form
          onSubmit={handleReport}
          className="absolute right-0 z-10 mt-1 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg"
        >
          <p className="mb-2 text-xs font-semibold text-[var(--foreground)]">
            Zgłoś {targetName} - podaj powód
          </p>
          <textarea
            className="mb-2 w-full min-h-16 resize-none rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--spark-1)]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            placeholder="Np. nieodpowiednie zdjęcia, spam, podszywanie się..."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              className="flex-1 rounded-lg border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--foreground)]"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
            >
              Wyślij
            </button>
          </div>
        </form>
      )}

      {message && (
        <p className="absolute right-0 z-10 mt-1 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs text-[var(--muted)] shadow-lg">
          {message}{" "}
          <button type="button" onClick={() => setMessage(null)} className="underline">
            OK
          </button>
        </p>
      )}
    </div>
  );
}
