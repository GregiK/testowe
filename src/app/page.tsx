import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { isDemoModeEnabled } from "@/lib/demo";
import { AnimatedHero } from "@/components/home/animated-hero";

export default async function Home() {
  const userId = await getCurrentUserId();
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <main className="flex w-full max-w-5xl flex-col items-center">
        <AnimatedHero demoModeEnabled={isDemoModeEnabled()} />
      </main>
    </div>
  );
}
