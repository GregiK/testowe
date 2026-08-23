import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { messageSchema } from "@/lib/validation/message";
import { checkRateLimit } from "@/lib/rate-limit";

// Nigdy nie ufamy samemu matchId przesłanemu przez klienta - każdorazowo sprawdzamy
// członkostwo zalogowanego użytkownika w tym matchu.
async function assertMembership(matchId: string, userId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.unmatchedAt) return null;
  if (match.userAId !== userId && match.userBId !== userId) return null;
  return match;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const { id } = await params;
  const match = await assertMembership(id, userId);
  if (!match) {
    return NextResponse.json({ error: "Dopasowanie nie istnieje." }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { matchId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const rl = checkRateLimit(`message:${userId}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Zbyt wiele wiadomości. Zwolnij tempo." }, { status: 429 });
  }

  const { id } = await params;
  const match = await assertMembership(id, userId);
  if (!match) {
    return NextResponse.json({ error: "Dopasowanie nie istnieje." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Nieprawidłowa wiadomość.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const message = await prisma.message.create({
    data: { matchId: id, senderId: userId, body: parsed.data.body },
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  return NextResponse.json({ message }, { status: 201 });
}
