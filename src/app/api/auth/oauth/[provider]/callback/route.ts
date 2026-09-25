import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { trackEvent } from "@/lib/analytics";
import {
  isOAuthProvider,
  getProviderCredentials,
  getRedirectUri,
  exchangeCodeForToken,
  fetchOAuthProfile,
  OAUTH_STATE_COOKIE,
} from "@/lib/oauth";

function loginErrorRedirect(req: NextRequest, code: string) {
  return NextResponse.redirect(new URL(`/login?oauth_error=${code}`, req.url));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ error: "Nieznany dostawca logowania." }, { status: 404 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`oauth_callback:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." }, { status: 429 });
  }

  const searchParams = req.nextUrl.searchParams;
  const providerError = searchParams.get("error");
  if (providerError) {
    // Użytkownik odmówił zgody albo dostawca zwrócił błąd - to nie jest awaria naszej strony.
    return loginErrorRedirect(req, "denied");
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  // Zawsze kasujemy cookie po jednorazowym użyciu, niezależnie od wyniku walidacji.
  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (!code || !state || !cookieValue) {
    return loginErrorRedirect(req, "invalid_request");
  }

  const [expectedState, codeVerifier] = cookieValue.split(".");
  if (!expectedState || expectedState !== state) {
    // Niezgodność state - potencjalna próba CSRF na przepływie logowania. Nie ujawniamy
    // szczegółów użytkownikowi poza ogólnym komunikatem.
    logError("oauth_state_mismatch", new Error("state mismatch"), { provider });
    return loginErrorRedirect(req, "invalid_state");
  }

  const credentials = getProviderCredentials(provider);
  if (!credentials) {
    return loginErrorRedirect(req, "unavailable");
  }

  try {
    const redirectUri = getRedirectUri(provider);
    const accessToken = await exchangeCodeForToken(provider, {
      code,
      redirectUri,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      codeVerifier: codeVerifier || undefined,
    });
    const profile = await fetchOAuthProfile(provider, accessToken);

    if (!profile.providerAccountId) {
      return loginErrorRedirect(req, "profile_missing");
    }

    const existingLink = await prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId: profile.providerAccountId } },
      select: { userId: true },
    });

    let userId: string;
    let isNewUser = false;

    if (existingLink) {
      userId = existingLink.userId;
    } else {
      // Brak istniejącego powiązania - spróbuj znaleźć konto po zweryfikowanym e-mailu
      // (łączenie kont), w przeciwnym razie utwórz nowe konto. Wszystko w jednej transakcji,
      // żeby nie powstało konto bez powiązania przy równoczesnym żądaniu.
      const result = await prisma.$transaction(async (tx) => {
        let targetUserId: string | null = null;

        if (profile.email && profile.emailVerified) {
          const existingUser = await tx.user.findUnique({
            where: { email: profile.email, deletedAt: null },
            select: { id: true },
          });
          if (existingUser) targetUserId = existingUser.id;
        }

        let createdNew = false;
        if (!targetUserId) {
          if (!profile.email) {
            // Bez e-maila (dostawca go nie udostępnił / brak zgody) nie możemy założyć konta -
            // e-mail jest w tej aplikacji unikalnym identyfikatorem logowania.
            throw new Error("oauth_no_email");
          }
          const created = await tx.user.create({
            data: { email: profile.email, passwordHash: null },
            select: { id: true },
          });
          targetUserId = created.id;
          createdNew = true;
        }

        await tx.oAuthAccount.create({
          data: {
            userId: targetUserId,
            provider,
            providerAccountId: profile.providerAccountId,
            email: profile.email,
          },
        });

        return { userId: targetUserId, createdNew };
      });

      userId = result.userId;
      isNewUser = result.createdNew;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true, isActive: true, profile: { select: { id: true } } },
    });
    if (!user || user.deletedAt || !user.isActive) {
      return loginErrorRedirect(req, "account_unavailable");
    }

    await createSession(userId, { userAgent: req.headers.get("user-agent") ?? undefined });

    if (isNewUser) {
      await trackEvent("user_registered", { userId, metadata: { method: provider } });
    }
    await trackEvent("oauth_login", { userId, metadata: { provider } });

    // Konta bez uzupełnionego profilu (nowe konta OAuth) trafiają najpierw na onboarding -
    // Profile.birthDate jest wymagane (weryfikacja wieku 18+), a żaden z dostawców nie
    // udostępnia daty urodzenia w podstawowym zakresie uprawnień.
    const destination = user.profile ? "/app" : "/onboarding";
    return NextResponse.redirect(new URL(destination, req.url));
  } catch (err) {
    logError("oauth_callback_error", err, { provider });
    if (err instanceof Error && err.message === "oauth_no_email") {
      return loginErrorRedirect(req, "no_email");
    }
    return loginErrorRedirect(req, "failed");
  }
}
