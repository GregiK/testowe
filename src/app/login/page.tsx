import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { LoginForm } from "@/components/auth/login-form";
import { AuthAtmosphere } from "@/components/auth/auth-atmosphere";

export const metadata: Metadata = {
  title: "Zaloguj się - Iskra",
};

export default async function LoginPage() {
  const userId = await getCurrentUserId();
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <AuthAtmosphere />
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
          <h1 className="mt-3 text-lg font-bold text-[var(--foreground)]">Witaj z powrotem</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
