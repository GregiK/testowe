import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { reportSchema } from "@/lib/validation/report";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const rl = checkRateLimit(`report:${userId}`, 10, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Zbyt wiele zgłoszeń. Spróbuj później." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Nieprawidłowe dane.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { targetUserId, reason } = parsed.data;

  if (targetUserId === userId) {
    return NextResponse.json({ error: "Nie można zgłosić samego siebie." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId, deletedAt: null },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Użytkownik nie istnieje." }, { status: 404 });
  }

  await prisma.report.create({
    data: {
      reporterId: userId,
      targetId: targetUserId,
      entityType: "PROFILE",
      reason,
    },
  });

  return NextResponse.json({ ok: true });
}
