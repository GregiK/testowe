"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--spark-2)]/60";

type Gender = "MALE" | "FEMALE" | "OTHER";

const genderLabel: Record<Gender, string> = {
  MALE: "Mężczyzna",
  FEMALE: "Kobieta",
  OTHER: "Inna",
};

export function OnboardingForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>("OTHER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, birthDate, gender }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Coś poszło nie tak. Spróbuj ponownie.");
        return;
      }

      router.push("/app");
      router.refresh();
    } catch {
      setError("Brak połączenia z serwerem. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-xs font-semibold text-[var(--muted)]">
          Imię widoczne w profilu
        </label>
        <input
          id="displayName"
          type="text"
          className={inputClass}
          placeholder="np. Kasia"
          maxLength={50}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="birthDate" className="text-xs font-semibold text-[var(--muted)]">
          Data urodzenia
        </label>
        <input
          id="birthDate"
          type="date"
          className={inputClass}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="gender" className="text-xs font-semibold text-[var(--muted)]">
          Płeć
        </label>
        <select
          id="gender"
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
      </div>

      {error && (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-xs font-medium text-[var(--danger)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-bold text-[#1b1520] transition disabled:opacity-60"
        style={{ backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)" }}
      >
        {loading ? "Zapisywanie..." : "Przejdź do aplikacji"}
      </button>
    </form>
  );
}
