import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  isOAuthProvider,
  getProviderCredentials,
  getRedirectUri,
  generateState,
  generatePkcePair,
  buildAuthorizationUrl,
  OAUTH_STATE_COOKIE,
} from "@/lib/oauth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ error: "Nieznany dostawca logowania." }, { status: 404 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`oauth_start:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." }, { status: 429 });
  }

  const credentials = getProviderCredentials(provider);
  if (!credentials) {
    // Administrator nie skonfigurował jeszcze kluczy tego dostawcy (zmienne środowiskowe) -
    // wracamy na login z czytelnym komunikatem zamiast pokazywać błąd 500.
    return NextResponse.redirect(new URL("/login?oauth_error=unavailable", req.url));
  }

  const state = generateState();
  const pkce = generatePkcePair();
  // Wartość cookie: "<state>.<verifier>" - verifier używany wyłącznie dla dostawców z PKCE
  // (Google); dla Facebooka zostaje pusty. Cookie jest httpOnly i wygasa po 10 minutach,
  // więc nawet przy przechwyceniu URL-a przekierowania atakujący nie ma dostępu do jej treści.
  const cookieValue = `${state}.${pkce.verifier}`;
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/oauth",
    maxAge: 600,
  });

  const redirectUri = getRedirectUri(provider);
  const authUrl = buildAuthorizationUrl(provider, {
    clientId: credentials.clientId,
    redirectUri,
    state,
    codeChallenge: pkce.challenge,
  });

  return NextResponse.redirect(authUrl);
}
