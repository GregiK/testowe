// Prosty rate limiter w pamięci procesu (fixed window). Wystarczający dla MVP na
// pojedynczym procesie Passenger (Aderlo Cloud, Redis wyłączony). Ograniczenie: liczniki
// nie są współdzielone między procesami/restartami - przy skalowaniu poziomym przenieść
// do współdzielonego magazynu (np. tabela w MySQL albo Redis, jeśli zostanie włączony).
// Patrz docs/assumptions.md.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
