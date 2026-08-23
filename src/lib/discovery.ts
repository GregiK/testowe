import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/age";

export type DiscoveryCandidate = {
  userId: string;
  displayName: string;
  age: number;
  city: string | null;
  bio: string | null;
  interests: string[];
};

// Zwraca kandydatów do przeglądania (discovery) dla danego użytkownika.
// Wyklucza: siebie samego, konta usunięte/nieaktywne, zablokowane (w obie strony),
// już ocenione swipe'em (LIKE/PASS/SUPERLIKE - tabela Swipe, gdy pojawi się w Etapie 7).
// Filtruje WZAJEMNIE: wiek i płeć muszą pasować z obu stron (moje preferencje względem
// kandydata i preferencje kandydata względem mnie) - inaczej pokazywalibyśmy profile,
// które i tak nigdy nie zobaczą/nie polubią użytkownika z drugiej strony.
// Odległość geograficzna celowo pominięta na tym etapie - zbieranie lokalizacji
// (approxLat/Lng) nie jest jeszcze wpięte w formularz profilu, patrz docs/assumptions.md.
export async function getDiscoveryCandidates(
  userId: string,
  limit = 20,
): Promise<DiscoveryCandidate[]> {
  const me = await prisma.profile.findUnique({
    where: { userId },
    include: { preference: true },
  });

  if (!me) return [];

  const myAge = calculateAge(me.birthDate);

  const blocks = await prisma.block.findMany({
    where: { OR: [{ initiatorId: userId }, { targetId: userId }] },
    select: { initiatorId: true, targetId: true },
  });
  const blockedIds = new Set(
    blocks.flatMap((b) => [b.initiatorId, b.targetId]).filter((id) => id !== userId),
  );

  const swipes = await prisma.swipe.findMany({
    where: { initiatorId: userId },
    select: { targetId: true },
  });
  const swipedIds = swipes.map((s) => s.targetId);

  const excludeIds = [userId, ...blockedIds, ...swipedIds];

  const candidates = await prisma.profile.findMany({
    where: {
      userId: { notIn: excludeIds },
      isVisible: true,
      user: { deletedAt: null, isActive: true },
      ...(me.preference?.interestedIn ? { gender: me.preference.interestedIn } : {}),
    },
    include: {
      interests: { include: { interest: true } },
      preference: true,
    },
    take: 100,
    orderBy: { createdAt: "asc" },
  });

  const filtered = candidates.filter((c) => {
    const age = calculateAge(c.birthDate);
    if (me.preference && (age < me.preference.minAge || age > me.preference.maxAge)) {
      return false;
    }
    if (c.preference) {
      if (myAge < c.preference.minAge || myAge > c.preference.maxAge) return false;
      if (c.preference.interestedIn && c.preference.interestedIn !== me.gender) return false;
    }
    return true;
  });

  return filtered.slice(0, limit).map((c) => ({
    userId: c.userId,
    displayName: c.displayName,
    age: calculateAge(c.birthDate),
    city: c.city,
    bio: c.bio,
    interests: c.interests.map((i) => i.interest.name),
  }));
}
