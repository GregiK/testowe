"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Interest = { id: string; name: string };
type Gender = "MALE" | "FEMALE" | "OTHER";

type ProfileData = {
  gender: Gender;
  bio: string;
  city: string;
  interestIds: string[];
  allInterests: Interest[];
  preference: {
    minAge: number;
    maxAge: number;
    maxDistanceKm: number;
    interestedIn: Gender | null;
  } | null;
};

const genderLabel: Record<Gender, string> = {
  MALE: "Mężczyzna",
  FEMALE: "Kobieta",
  OTHER: "Inna",
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--spark-1)]";

export function ProfileForm({ initial }: { initial: ProfileData }) {
  const router = useRouter();
  const [gender, setGender] = useState<Gender>(initial.gender);
  const [bio, setBio] = useState(initial.bio);
  const [city, setCity] = useState(initial.city);
  const [interestIds, setInterestIds] = useState<string[]>(initial.interestIds);
  const [minAge, setMinAge] = useState(initial.preference?.minAge ?? 18);
  const [maxAge, setMaxAge] = useState(initial.preference?.maxAge ?? 99);
  const [maxDistanceKm, setMaxDistanceKm] = useState(initial.preference?.maxDistanceKm ?? 50);
  const [interestedIn, setInterestedIn] = useState<Gender | "">(initial.preference?.interestedIn ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleInterest(id: string) {
    setInterestIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length >= 10
          ? prev
          : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gender,
        bio,
        city,
        interestIds,
        minAge: Number(minAge),
        maxAge: Number(maxAge),
        maxDistanceKm: Number(maxDistanceKm),
        interestedIn: interestedIn || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Nie udało się zapisać profilu.");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          O Tobie
        </h2>

        <label className="flex flex-col gap-1.5 text-sm text-[var(--foreground)]">
          Płeć
          <select
            className={inputClass}
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
          >
            {(Object.keys(genderLabel) as Gender[]).map((g) => (
              <option key={g} value={g}>
                {genderLabel[g]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-[var(--foreground)]">
          Miasto
          <input
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={100}
            placeholder="np. Warszawa"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-[var(--foreground)]">
          O mnie
          <textarea
            className={`${inputClass} min-h-24 resize-none`}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            placeholder="Kilka słów o Tobie..."
          />
          <span className="text-right text-xs text-[var(--muted)]">{bio.length}/500</span>
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          Zainteresowania (max 10)
        </h2>
        <div className="flex flex-wrap gap-2">
          {initial.allInterests.map((interest) => {
            const active = interestIds.includes(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-[var(--spark-1)] bg-[var(--spark-1)]/15 text-[var(--spark-1)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--spark-1)]/50"
                }`}
              >
                {interest.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          Kogo szukasz
        </h2>

        <label className="flex flex-col gap-1.5 text-sm text-[var(--foreground)]">
          Płeć osób, które chcesz widzieć
          <select
            className={inputClass}
            value={interestedIn}
            onChange={(e) => setInterestedIn(e.target.value as Gender | "")}
          >
            <option value="">Wszystkie</option>
            {(Object.keys(genderLabel) as Gender[]).map((g) => (
              <option key={g} value={g}>
                {genderLabel[g]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5 text-sm text-[var(--foreground)]">
            Wiek od
            <input
              type="number"
              className={inputClass}
              value={minAge}
              min={18}
              max={99}
              onChange={(e) => setMinAge(Number(e.target.value))}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1.5 text-sm text-[var(--foreground)]">
            Wiek do
            <input
              type="number"
              className={inputClass}
              value={maxAge}
              min={18}
              max={99}
              onChange={(e) => setMaxAge(Number(e.target.value))}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-[var(--foreground)]">
          Maksymalna odległość: {maxDistanceKm} km
          <input
            type="range"
            min={1}
            max={500}
            value={maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
          />
        </label>
      </section>

      {error && (
        <p className="rounded-lg bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-[var(--match)]/10 px-3 py-2 text-sm text-[var(--match)]">
          Zapisano zmiany.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
      >
        {loading ? "Zapisywanie..." : "Zapisz profil"}
      </button>
    </form>
  );
}
