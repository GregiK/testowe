import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

// Blokada jest jednostronna i natychmiastowa: kończy każdy istniejący (aktywny) match
// z tą osobą oraz uniemożliwia jej pojawienie się ponownie w discovery/swipe (patrz
// src/lib/discovery.ts i src/app/api/swipes/route.ts - obie sprawdzają tabelę Block).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const { id: targetUserId } = await params;

  if (targetUserId === userId) {
    return NextResponse.json({ error: "Nie można zablokować samego siebie." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId, deletedAt: null },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Użytkownik nie istnieje." }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.block.create({ data: { initiatorId: userId, targetId: targetUserId } });

      const [userAId, userBId] = [userId, targetUserId].sort();
      await tx.match.updateMany({
        where: { userAId, userBId, unmatchedAt: null },
        data: { unmatchedAt: new Date(), unmatchedBy: userId },
      });
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Już zablokowany wcześniej - idempotentnie zwracamy sukces.
      return NextResponse.json({ ok: true, alreadyBlocked: true });
    }
    console.error("block_error", err);
    return NextResponse.json({ error: "Wystąpił błąd. Spróbuj ponownie później." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
