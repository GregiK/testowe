import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { LoginForm } from "@/components/auth/login-form";
import { CinematicAuthBackground } from "@/components/auth/cinematic-background";
import { AuthCardReveal } from "@/components/auth/auth-card-reveal";
import { DemoAccess } from "@/components/auth/demo-access";
import { isDemoModeEnabled } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Zaloguj się - Iskra",
};

export default async function LoginPage() {
  const userId = await getCurrentUserId();
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10 sm:justify-center sm:py-12">
      <div className="w-full max-w-sm">
        <CinematicAuthBackground>
          <span
            className="text-3xl italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]"
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
          <h1 className="mt-3 text-lg font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
            Witaj z powrotem
          </h1>
        </CinematicAuthBackground>
        <div className="mt-8">
          <AuthCardReveal>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
            {isDemoModeEnabled() && <DemoAccess />}
          </AuthCardReveal>
        </div>
      </div>
    </div>
  );
}
