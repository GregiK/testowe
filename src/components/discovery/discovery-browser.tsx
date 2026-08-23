"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SafetyMenu } from "@/components/safety/safety-menu";

type Candidate = {
  userId: string;
  displayName: string;
  age: number;
  city: string | null;
  bio: string | null;
  interests: string[];
};

export function DiscoveryBrowser({ initial }: { initial: Candidate[] }) {
  const router = useRouter();
  const [candidates, setCandidates] = useState(initial);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [matchInfo, setMatchInfo] = useState<{ name: string; matchId: string } | null>(null);

  const current = candidates[index];

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
        <span className="text-4xl">🔍</span>
        <h2 className="text-base font-bold text-[var(--foreground)]">Brak nowych profili</h2>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Na razie nie ma nikogo nowego do pokazania - sprawdź ponownie później, albo poszerz
          swoje preferencje wyszukiwania w profilu.
        </p>
      </div>
    );
  }

  async function handleSwipe(action: "LIKE" | "PASS") {
    if (!current || busy) return;
    setBusy(true);

    try {
      const res = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: current.userId, action }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.match) {
        setMatchInfo({ name: current.displayName, matchId: data.matchId });
      }

      // Usuwamy ocenioną osobę z lokalnej listy - nie pojawi się ponownie w tej sesji.
      setCandidates((prev) => prev.filter((c) => c.userId !== current.userId));
      setIndex((i) => Math.min(i, Math.max(0, candidates.length - 2)));
    } finally {
      setBusy(false);
    }
  }

  if (matchInfo) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--match)]/40 bg-[var(--match)]/10 px-6 py-12 text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-xl font-bold text-[var(--foreground)]">To dopasowanie!</h2>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Ty i {matchInfo.name} polubiliście się nawzajem. Możecie teraz napisać do siebie.
        </p>
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={() => setMatchInfo(null)}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
          >
            Przeglądaj dalej
          </button>
          <button
            type="button"
            onClick={() => router.push(`/app/matches/${matchInfo.matchId}`)}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
          >
            Napisz wiadomość
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
        <span className="text-4xl">✅</span>
        <h2 className="text-base font-bold text-[var(--foreground)]">To wszyscy na teraz</h2>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Oceniłeś/aś wszystkie dostępne profile. Wróć później po nowe.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div
          className="flex h-48 items-center justify-center text-6xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
          aria-hidden="true"
        >
          {current.displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {current.displayName}, {current.age}
              </h2>
              {current.city && (
                <span className="text-sm text-[var(--muted)]">📍 {current.city}</span>
              )}
            </div>
            <SafetyMenu
              targetUserId={current.userId}
              targetName={current.displayName}
              onBlocked={() => {
                setCandidates((prev) => prev.filter((c) => c.userId !== current.userId));
                setIndex((i) => Math.min(i, Math.max(0, candidates.length - 2)));
              }}
            />
          </div>

          {current.bio && (
            <p className="text-sm leading-6 text-[var(--foreground)]">{current.bio}</p>
          )}

          {current.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {current.interests.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => handleSwipe("PASS")}
          className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition disabled:opacity-50"
        >
          ✕ Pomiń
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => handleSwipe("LIKE")}
          className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
        >
          ♥ Polub
        </button>
      </div>

      <p className="text-center text-xs text-[var(--muted)]">
        Pozostało: {candidates.length}
      </p>
    </div>
  );
}
