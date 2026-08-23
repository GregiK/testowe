import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// Endpoint do monitoringu zewnętrznego (np. UptimeRobot/Better Uptime) - sprawdza nie
// tylko czy proces Node żyje, ale też czy aplikacja faktycznie ma połączenie z bazą
// danych. Samo "strona się ładuje" nie wykrywa np. błędnego DATABASE_URL po zmianie
// zmiennych środowiskowych w panelu Aderlo.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (err) {
    logError("health_check_failed", err);
    return NextResponse.json({ status: "error", database: "disconnected" }, { status: 503 });
  }
}
