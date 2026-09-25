import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { isDemoModeEnabled } from "@/lib/demo";
import { AnimatedHero } from "@/components/home/animated-hero";
import { CinematicAuthBackground } from "@/components/auth/cinematic-background";

export default async function Home() {
  const userId = await getCurrentUserId();
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10 sm:justify-center sm:py-12">
      <main className="flex w-full max-w-5xl flex-col items-center">
        {/* Etap 21: ten sam wyrazny, kinowy baner (Ken Burns + iskierki + ziarno
            filmowe) co na /login i /register, teraz takze na stronie glownej, jako
            widoczny element na gorze strony (nie ukryte tlo). Tresc hero
            (AnimatedHero, Etap 18) zostaje bez zmian i wjezdza ponizej banera. */}
        <div className="w-full">
          <CinematicAuthBackground />
        </div>
        <div className="mt-8 w-full sm:mt-12">
          <AnimatedHero demoModeEnabled={isDemoModeEnabled()} />
        </div>
      </main>
    </div>
  );
}
