"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--spark-2)]/60";

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password, birthDate }),
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
          Jak mamy Cię przedstawiać?
        </label>
        <input
          id="displayName"
          className={inputClass}
          placeholder="Np. Kasia"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
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
        <label htmlFor="email" className="text-xs font-semibold text-[var(--muted)]">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          className={inputClass}
          placeholder="ty@przyklad.pl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-semibold text-[var(--muted)]">
          Hasło (min. 10 znaków)
        </label>
        <input
          id="password"
          type="password"
          className={inputClass}
          placeholder="Wybierz silne hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={10}
          maxLength={128}
          required
        />
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
        {loading ? "Zakładanie konta..." : "Załóż konto"}
      </button>

      <p className="text-center text-xs text-[var(--muted)]">
        Masz już konto?{" "}
        <Link href="/login" className="font-semibold text-[var(--spark-1)]">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
