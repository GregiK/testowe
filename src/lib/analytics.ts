import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// Minimalny lejek zdarzeń pod beta/analitykę (Etap 13) - świadomie bez treści wiadomości,
// adresów IP czy innych danych wrażliwych. Awaria zapisu zdarzenia NIGDY nie powinna
// przerwać właściwej akcji użytkownika (np. rejestracji) - błąd jest wyłącznie logowany.
export async function trackEvent(
  name: string,
  opts?: { userId?: string | null; metadata?: Record<string, string | number | boolean> },
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name,
        userId: opts?.userId ?? null,
        metadata: opts?.metadata ? JSON.stringify(opts.metadata) : null,
      },
    });
  } catch (err) {
    logError("analytics_track_failed", err, { name });
  }
}
