import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata: Metadata = {
  title: "Dokończ zakładanie konta - Iskra",
};

export default async function OnboardingPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (profile) {
    // Profil już istnieje (np. użytkownik wrócił na ten adres po zakończeniu onboardingu) -
    // nie ma czego uzupełniać.
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span
            className="text-3xl italic"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              backgroundImage: "linear-gradient(135deg, var(--spark-1), var(--spark-2) 70%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Iskra
          </span>
          <h1 className="mt-3 text-lg font-bold text-[var(--foreground)]">Jeszcze jeden krok</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Twój dostawca logowania nie przekazał nam daty urodzenia ani płci - potrzebujemy ich,
            żeby zweryfikować wiek (18+) i pokazać Ci właściwe osoby.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
