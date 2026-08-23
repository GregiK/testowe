import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Twój profil - Iskra",
};

export default async function ProfilePage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
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
    redirect("/login");
  }

  const allInterests = await prisma.interest.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[var(--foreground)]">Twój profil</h1>
          <a href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Wróć
          </a>
        </div>
        <ProfileForm
          initial={{
            gender: profile.gender,
            bio: profile.bio ?? "",
            city: profile.city ?? "",
            interestIds: profile.interests.map((i) => i.interestId),
            allInterests,
            preference: profile.preference,
          }}
        />
      </div>
    </div>
  );
}
