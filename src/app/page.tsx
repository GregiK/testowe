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
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      {/* Etap 20: to samo kinowe tlo (Ken Burns + iskierki + ziarno filmowe) co na
          /login i /register (Etap 19), teraz takze na stronie glownej. Tresc hero
          (AnimatedHero, Etap 18) zostaje bez zmian i wjezdza nad tlem. */}
      <CinematicAuthBackground />
      <main className="flex w-full max-w-5xl flex-col items-center">
        <AnimatedHero demoModeEnabled={isDemoModeEnabled()} />
      </main>
    </div>
  );
}
