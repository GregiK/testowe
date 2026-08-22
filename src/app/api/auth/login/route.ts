import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const GENERIC_ERROR = "Nieprawidłowy e-mail lub hasło.";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`login:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Zawsze wykonaj weryfikację hasła (nawet gdy user nie istnieje) - stały czas odpowiedzi,
  // zapobiega enumeracji kont na podstawie różnic w czasie odpowiedzi.
  const dummyHash = "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$invalidhashplaceholder";
  const ok = await verifyPassword(user?.passwordHash ?? dummyHash, password);

  if (!user || !ok || user.deletedAt || !user.isActive) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  await createSession(user.id, {
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
