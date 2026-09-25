import { randomBytes, createHash } from "node:crypto";

// Logowanie przez zewnętrznych dostawców (Etap 15). Celowo bez zewnętrznej biblioteki
// (np. NextAuth) - aplikacja ma już własny, prosty system sesji oparty o opaque token
// w cookie (patrz src/lib/session.ts). Wprowadzenie NextAuth wymagałoby migracji całego
// modelu sesji i byłoby nieproporcjonalnie dużą zmianą względem korzyści. Zamiast tego
// implementujemy standardowy przepływ OAuth2 Authorization Code (+ PKCE dla Google) ręcznie,
// używając wyłącznie wbudowanych w Node.js modułów (crypto, fetch) - zero nowych zależności,
// więc zero ryzyka związanego z limitem procesów kompilujących natywne moduły (EAGAIN) na
// hostingu Aderlo Cloud. Patrz docs/assumptions.md.

export type OAuthProviderId = "google" | "facebook";

export const OAUTH_PROVIDERS: OAuthProviderId[] = ["google", "facebook"];

// Nazwa cookie przechowującej stan przepływu OAuth (state + PKCE verifier).
// Uwaga (naprawa 2026-09-25): ta stała mieszkała wcześniej w
// src/app/api/auth/oauth/[provider]/start/route.ts i była stamtąd importowana przez
// .../callback/route.ts. Next.js (od pewnej wersji) waliduje eksporty z plików route.ts
// pod typowane trasy i NIE pozwala na dowolne dodatkowe nazwane eksporty (dozwolone są
// tylko metody HTTP i kilka specjalnych pól jak "dynamic"/"revalidate") - obecność
// OAUTH_STATE_COOKIE łamała tę walidację i powodowała błąd TS2344 WYŁĄCZNIE podczas
// pełnego `next build` (nie łapał tego `tsc --noEmit` na samych plikach źródłowych, bo
// to sprawdzenie dotyczy plików generowanych przez Next w .next/types podczas builda).
// To właśnie ten błąd od kilku etapów cicho wywalał build w GitHub Actions, mimo że
// lokalne `tsc --noEmit` i `vitest` przechodziły bez zarzutu - branch "deploy" nie był
// od dawna aktualizowany. Przeniesienie stałej tutaj (zwykły plik biblioteki, nie trasa)
// naprawia problem.
export const OAUTH_STATE_COOKIE = "oauth_flow";

export function isOAuthProvider(value: string): value is OAuthProviderId {
  return (OAUTH_PROVIDERS as string[]).includes(value);
}

type ProviderConfig = {
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  usesPkce: boolean;
  clientIdEnv: string;
  clientSecretEnv: string;
  label: string;
};

const PROVIDER_CONFIG: Record<OAuthProviderId, ProviderConfig> = {
  google: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
    scope: "openid email profile",
    usesPkce: true,
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    label: "Google",
  },
  facebook: {
    // v19.0 - najnowsza stabilna wersja Graph API w chwili wdrożenia; podbijać co ok. 2 lata
    // zgodnie z cyklem wsparcia wersji Meta Graph API.
    authorizationUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    userInfoUrl: "https://graph.facebook.com/me",
    scope: "email public_profile",
    usesPkce: false,
    clientIdEnv: "FACEBOOK_CLIENT_ID",
    clientSecretEnv: "FACEBOOK_CLIENT_SECRET",
    label: "Facebook",
  },
};

export function getProviderLabel(provider: OAuthProviderId): string {
  return PROVIDER_CONFIG[provider].label;
}

export function getRedirectUri(provider: OAuthProviderId): string {
  const base = process.env.APP_BASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/api/auth/oauth/${provider}/callback`;
}

// Zwraca null, gdy administrator nie skonfigurował jeszcze danych dostawcy (brak env) -
// pozwala to obsłużyć ten przypadek jako czytelny komunikat zamiast błędu 500.
export function getProviderCredentials(
  provider: OAuthProviderId,
): { clientId: string; clientSecret: string } | null {
  const config = PROVIDER_CONFIG[provider];
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

export function generateState(): string {
  return base64url(randomBytes(32));
}

export function generatePkcePair(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function buildAuthorizationUrl(
  provider: OAuthProviderId,
  params: { clientId: string; redirectUri: string; state: string; codeChallenge?: string },
): string {
  const config = PROVIDER_CONFIG[provider];
  const url = new URL(config.authorizationUrl);
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", params.state);
  if (config.usesPkce && params.codeChallenge) {
    url.searchParams.set("code_challenge", params.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url.toString();
}

type NormalizedProfile = {
  providerAccountId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
};

export async function exchangeCodeForToken(
  provider: OAuthProviderId,
  params: { code: string; redirectUri: string; clientId: string; clientSecret: string; codeVerifier?: string },
): Promise<string> {
  const config = PROVIDER_CONFIG[provider];
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    code: params.code,
    redirect_uri: params.redirectUri,
    grant_type: "authorization_code",
  });
  if (config.usesPkce && params.codeVerifier) {
    body.set("code_verifier", params.codeVerifier);
  }

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  if (!res.ok) {
    throw new Error(`oauth_token_exchange_failed:${provider}:${res.status}`);
  }
  const data: unknown = await res.json();
  const accessToken =
    typeof data === "object" && data !== null && "access_token" in data
      ? (data as { access_token: unknown }).access_token
      : undefined;
  if (typeof accessToken !== "string" || !accessToken) {
    throw new Error(`oauth_token_missing:${provider}`);
  }
  return accessToken;
}

export async function fetchOAuthProfile(
  provider: OAuthProviderId,
  accessToken: string,
): Promise<NormalizedProfile> {
  const config = PROVIDER_CONFIG[provider];
  const url = new URL(config.userInfoUrl);
  if (provider === "facebook") {
    url.searchParams.set("fields", "id,name,email");
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`oauth_userinfo_failed:${provider}:${res.status}`);
  }
  const raw = (await res.json()) as Record<string, unknown>;

  if (provider === "google") {
    return {
      providerAccountId: String(raw.sub ?? ""),
      email: typeof raw.email === "string" ? raw.email : null,
      // Google potwierdza własność adresu e-mail - ufamy tej fladze przy łączeniu kont.
      emailVerified: raw.email_verified === true || raw.email_verified === "true",
      name: typeof raw.name === "string" ? raw.name : null,
    };
  }

  // Facebook: pole email jest zwracane przez Graph API wyłącznie dla potwierdzonych,
  // aktywnych adresów - jego obecność traktujemy jako równoważną weryfikacji.
  return {
    providerAccountId: String(raw.id ?? ""),
    email: typeof raw.email === "string" ? raw.email : null,
    emailVerified: typeof raw.email === "string" && raw.email.length > 0,
    name: typeof raw.name === "string" ? raw.name : null,
  };
}
