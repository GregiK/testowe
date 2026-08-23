import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ChatThread } from "@/components/chat/chat-thread";

export const metadata: Metadata = {
  title: "Rozmowa - Iskra",
};

export default async function MatchChatPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  // Nigdy nie ufamy samemu id matchu z URL - sprawdzamy członkostwo zalogowanego usera.
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      userA: { select: { id: true, profile: { select: { displayName: true } } } },
      userB: { select: { id: true, profile: { select: { displayName: true } } } },
    },
  });

  if (!match || match.unmatchedAt || (match.userAId !== userId && match.userBId !== userId)) {
    notFound();
  }

  const other = match.userAId === userId ? match.userB : match.userA;
  const otherName = other.profile?.displayName ?? "Użytkownik";

  const messages = await prisma.message.findMany({
    where: { matchId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[var(--foreground)]">{otherName}</h1>
          <a href="/app/matches" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Wróć
          </a>
        </div>
        <ChatThread
          matchId={id}
          myUserId={userId}
          initialMessages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
        />
      </div>
    </div>
  );
}
