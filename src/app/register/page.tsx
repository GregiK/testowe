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
        <CinematicAuthBackground />
        <div className="mb-8 mt-8 text-center sm:mt-10">
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
          <h1 className="mt-3 text-lg font-bold text-[var(--foreground)]">Załóż konto</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">Dostępne wyłącznie dla osób pełnoletnich (18+).</p>
        </div>
        <AuthCardReveal>
          <RegisterForm />
        </AuthCardReveal>
      </div>
    </div>
  );
}
