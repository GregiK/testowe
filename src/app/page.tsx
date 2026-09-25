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
        {/* Etap 21: wyrazny, kinowy baner (Ken Burns + iskierki + ziarno filmowe) na
            gorze strony. Etap 24: logo "Iskra" + odznaka "Wersja robocza" renderuja
            sie teraz JAKO NAKLADKA na tym banerze (children), spojnie z /login i
            /register (Etap 23), zamiast osobno w AnimatedHero na czarnym tle. */}
        <div className="w-full">
          <CinematicAuthBackground>
            <span className="mb-2 inline-block rounded-full border border-white/30 bg-black/20 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
              Wersja robocza &middot; MVP w budowie
            </span>
            <h1
              className="text-6xl italic tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                backgroundImage: "linear-gradient(100deg, #fff 40%, var(--spark-1) 75%, var(--spark-2) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Iskra
            </h1>
          </CinematicAuthBackground>
        </div>
        <div className="mt-8 w-full sm:mt-12">
          <AnimatedHero demoModeEnabled={isDemoModeEnabled()} />
        </div>
      </main>
    </div>
  );
}
