import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { swipeSchema } from "@/lib/validation/swipe";
import { checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  // Limit chroni przed automatyzacją/spamem swipe'ów.
  const rl = checkRateLimit(`swipe:${userId}`, 120, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Zbyt wiele akcji. Zwolnij tempo." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = swipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Nieprawidłowe dane.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { targetUserId, action } = parsed.data;

  if (targetUserId === userId) {
    return NextResponse.json({ error: "Nie można ocenić własnego profilu." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId, deletedAt: null, isActive: true },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Profil nie istnieje." }, { status: 404 });
  }

  const blocked = await prisma.block.findFirst({
    where: {
      OR: [
        { initiatorId: userId, targetId: targetUserId },
        { initiatorId: targetUserId, targetId: userId },
      ],
    },
    select: { id: true },
  });
  if (blocked) {
    return NextResponse.json({ error: "Ta akcja nie jest dostępna." }, { status: 403 });
  }

  let matchId: string | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.swipe.create({ data: { initiatorId: userId, targetId: targetUserId, action } });

      if (action === "LIKE" || action === "SUPERLIKE") {
        // Sprawdzamy, czy druga strona wcześniej polubiła nas - jeśli tak, tworzymy match.
        const reciprocal = await tx.swipe.findUnique({
          where: { initiatorId_targetId: { initiatorId: targetUserId, targetId: userId } },
        });

        if (reciprocal && (reciprocal.action === "LIKE" || reciprocal.action === "SUPERLIKE")) {
          // Kanoniczne sortowanie identyfikatorów - wyklucza duplikaty matchu niezależnie
          // od tego, kto polubił jako pierwszy.
          const [userAId, userBId] = [userId, targetUserId].sort();
          const match = await tx.match.upsert({
            where: { userAId_userBId: { userAId, userBId } },
            create: { userAId, userBId },
            update: {},
          });
          matchId = match.id;
        }
      }
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Ten sam swipe już istnieje (np. podwójne kliknięcie) - traktujemy jako no-op,
      // nie ujawniamy szczegółów, żeby nie zdradzać stanu wewnętrznego innym userId.
      return NextResponse.json({ ok: true, alreadySwiped: true, match: false });
    }
    logError("swipe_error", err, { userId });
    return NextResponse.json({ error: "Wystąpił błąd. Spróbuj ponownie później." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, match: matchId !== null, matchId });
}
