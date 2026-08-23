import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { getDiscoveryCandidates } from "@/lib/discovery";
import { DiscoveryBrowser } from "@/components/discovery/discovery-browser";

export const metadata: Metadata = {
  title: "Odkrywaj - Iskra",
};

export default async function DiscoveryPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const candidates = await getDiscoveryCandidates(userId);

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[var(--foreground)]">Odkrywaj</h1>
          <a href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Wróć
          </a>
        </div>
        <DiscoveryBrowser initial={candidates} />
      </div>
    </div>
  );
}
