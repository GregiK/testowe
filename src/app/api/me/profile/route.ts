import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { profileUpdateSchema } from "@/lib/validation/profile";
import { trackEvent } from "@/lib/analytics";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      gender: true,
      bio: true,
      city: true,
      interests: { select: { interestId: true } },
      preference: {
        select: { minAge: true, maxAge: true, maxDistanceKm: true, interestedIn: true },
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil nie istnieje." }, { status: 404 });
  }

  const allInterests = await prisma.interest.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    gender: profile.gender,
    bio: profile.bio ?? "",
    city: profile.city ?? "",
    interestIds: profile.interests.map((i) => i.interestId),
    preference: profile.preference,
    allInterests,
  });
}

export async function PATCH(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Nieprawidłowe dane.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { gender, bio, city, interestIds, minAge, maxAge, maxDistanceKm, interestedIn } =
    parsed.data;

  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) {
    return NextResponse.json({ error: "Profil nie istnieje." }, { status: 404 });
  }

  // Ogranicz interestIds do faktycznie istniejących w katalogu - klient mógłby przesłać
  // dowolne wartości, więc nie ufamy im wprost przy zapisie do bazy.
  const validInterests = await prisma.interest.findMany({
    where: { id: { in: interestIds } },
    select: { id: true },
  });
  const validInterestIds = validInterests.map((i) => i.id);

  await prisma.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: profile.id },
      data: { gender, bio: bio || null, city: city || null },
    });

    await tx.profileInterest.deleteMany({ where: { profileId: profile.id } });
    if (validInterestIds.length > 0) {
      await tx.profileInterest.createMany({
        data: validInterestIds.map((interestId) => ({ profileId: profile.id, interestId })),
      });
    }

    await tx.preference.upsert({
      where: { profileId: profile.id },
      create: { profileId: profile.id, minAge, maxAge, maxDistanceKm, interestedIn },
      update: { minAge, maxAge, maxDistanceKm, interestedIn },
    });
  });

  await trackEvent("profile_updated", { userId });

  return NextResponse.json({ ok: true });
}
