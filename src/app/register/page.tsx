import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { RegisterForm } from "@/components/auth/register-form";
import { CinematicAuthBackground } from "@/components/auth/cinematic-background";
import { AuthCardReveal } from "@/components/auth/auth-card-reveal";

export const metadata: Metadata = {
  title: "Załóż konto - Iskra",
};

export default async function RegisterPage() {
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
            Załóż konto
          </h1>
          <p className="mt-1 text-xs text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
            Dostępne wyłącznie dla osób pełnoletnich (18+).
          </p>
        </CinematicAuthBackground>
        <div className="mt-8">
          <AuthCardReveal>
            <RegisterForm />
          </AuthCardReveal>
        </div>
      </div>
    </div>
  );
}
