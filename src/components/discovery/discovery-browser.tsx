"use client";

import { useState } from "react";

type Candidate = {
  userId: string;
  displayName: string;
  age: number;
  city: string | null;
  bio: string | null;
  interests: string[];
};

export function DiscoveryBrowser({ initial }: { initial: Candidate[] }) {
  const [candidates] = useState(initial);
  const [index, setIndex] = useState(0);

  const current = candidates[index];
  const hasMore = index < candidates.length - 1;
  const hasPrev = index > 0;

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
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {current.displayName}, {current.age}
            </h2>
            {current.city && (
              <span className="text-sm text-[var(--muted)]">📍 {current.city}</span>
            )}
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
          disabled={!hasPrev}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition disabled:opacity-40"
        >
          ← Poprzedni
        </button>
        <button
          type="button"
          disabled={!hasMore}
          onClick={() => setIndex((i) => Math.min(candidates.length - 1, i + 1))}
          className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
        >
          Następny →
        </button>
      </div>

      <p className="text-center text-xs text-[var(--muted)]">
        {index + 1} / {candidates.length}
      </p>
    </div>
  );
}
