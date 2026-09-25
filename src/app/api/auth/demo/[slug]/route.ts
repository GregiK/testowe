import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/analytics";
import { isDemoModeEnabled, findDemoProfile } from "@/lib/demo";

// Etap 16: wejście do aplikacji bez logowania - zalogowanie na jedno z gotowych kont demo.
// Świadomie GET (klikalny link, bez JS), tak jak start OAuth - logujemy w ten sposób
// wyłącznie z góry ustalone, nieprawdziwe konta demonstracyjne, nigdy dowolnego usera, więc
// nie ma tu problemu z "niebezpiecznym GET-em zmieniającym stan" typowym dla prawdziwych
// zasobów. Cała funkcja jest zablokowana, dopóki ktoś świadomie nie ustawi
// DEMO_MODE_ENABLED=true w zmiennych środowiskowych - patrz docs/assumptions.md (Etap 16).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isDemoModeEnabled()) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`demo_login:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.redirect(new URL("/login?error=too_many_requests", req.url));
  }

  const { slug } = await params;
  const demo = findDemoProfile(slug);
  if (!demo) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const user = await prisma.user.findUnique({ where: { id: demo.userId } });
  if (!user || user.deletedAt || !user.isActive) {
    // Konta demo nie zostały jeszcze zaimportowane - patrz docs/wdrozenie/iskra-demo-profiles.sql
    return NextResponse.redirect(new URL("/login?error=demo_unavailable", req.url));
  }

  await createSession(user.id, {
    userAgent: req.headers.get("user-agent") ?? undefined,
  });
  await trackEvent("demo_login", { userId: user.id, metadata: { profile: demo.slug } });

  return NextResponse.redirect(new URL("/app", req.url));
}
