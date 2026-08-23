import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: {
      unmatchedAt: null,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: { select: { id: true, profile: { select: { displayName: true } } } },
      userB: { select: { id: true, profile: { select: { displayName: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = matches.map((m) => {
    const other = m.userAId === userId ? m.userB : m.userA;
    const lastMessage = m.messages[0] ?? null;
    return {
      matchId: m.id,
      otherUserId: other.id,
      otherDisplayName: other.profile?.displayName ?? "Użytkownik",
      lastMessage: lastMessage
        ? { body: lastMessage.body, createdAt: lastMessage.createdAt, senderId: lastMessage.senderId }
        : null,
      createdAt: m.createdAt,
    };
  });

  return NextResponse.json({ matches: result });
}
