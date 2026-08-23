// Prosty, ustrukturyzowany logger (JSON na jedną linię - łatwy do sparsowania przez
// dowolne narzędzie do agregacji logów, gdyby hosting docelowy się zmienił). Świadomie
// loguje wyłącznie komunikat błędu, nigdy pełnego obiektu/req.body - zapobiega
// przypadkowemu wyciekowi haseł, tokenów sesji czy treści prywatnych wiadomości do logów.

type LogMeta = Record<string, string | number | boolean | null | undefined>;

function serialize(level: "error" | "warn" | "info", event: string, meta?: LogMeta) {
  return JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...meta,
  });
}

export function logError(event: string, err: unknown, meta?: LogMeta) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(serialize("error", event, { message, ...meta }));
}

export function logWarn(event: string, meta?: LogMeta) {
  console.warn(serialize("warn", event, meta));
}

export function logInfo(event: string, meta?: LogMeta) {
  console.info(serialize("info", event, meta));
}
