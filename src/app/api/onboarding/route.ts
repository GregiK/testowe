import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { onboardingSchema } from "@/lib/validation/onboarding";
import { isAdult } from "@/lib/validation/auth";
import { logError } from "@/lib/logger";
import { trackEvent } from "@/lib/analytics";

// Dokańcza założenie konta dla użytkowników, którzy zalogowali się przez OAuth i nie mają
// jeszcze profilu (patrz src/app/api/auth/oauth/[provider]/callback/route.ts). Idempotentne
// względem już istniejącego profilu, żeby dwukrotne kliknięcie "Zapisz" nie wywołało błędu.
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const existing = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ ok: true, alreadyCompleted: true });
  }

  const body = await req.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Nieprawidłowe dane.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { displayName, birthDate, gender } = parsed.data;

  if (!isAdult(birthDate)) {
    return NextResponse.json({ error: "Dostęp wyłącznie dla osób pełnoletnich." }, { status: 403 });
  }

  try {
    await prisma.profile.create({
      data: {
        userId,
        displayName,
        birthDate,
        gender,
        preference: { create: {} },
      },
    });

    await trackEvent("profile_updated", { userId, metadata: { source: "onboarding" } });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    logError("onboarding_error", err, { userId });
    return NextResponse.json({ error: "Wystąpił błąd. Spróbuj ponownie później." }, { status: 500 });
  }
}
