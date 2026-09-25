import Link from "next/link";
import { DEMO_PROFILES } from "@/lib/demo";

// Etap 16: sekcja "podejrzyj aplikację bez rejestracji" - renderowana wyłącznie, gdy
// DEMO_MODE_ENABLED=true (patrz src/lib/demo.ts). Każdy link loguje bezpośrednio na jedno
// z 5 gotowych kont demonstracyjnych, bez hasła.
export function DemoAccess() {
  return (
    <div className="mt-6 w-full rounded-xl border border-dashed border-[var(--border)] p-4">
      <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
        Podgląd bez zakładania konta (tryb demo)
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DEMO_PROFILES.map((p) => (
          <Link
            key={p.slug}
            href={`/api/auth/demo/${p.slug}`}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-left text-xs transition hover:border-[var(--spark-2)]/50"
          >
            <span className="block font-semibold text-[var(--foreground)]">{p.label}</span>
            <span className="block text-[var(--muted)]">{p.blurb}</span>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] leading-4 text-[var(--muted)]/70">
        Konta testowe, widoczne tylko lokalnie/do przeglądu - nie są to prawdziwi użytkownicy.
      </p>
    </div>
  );
}
