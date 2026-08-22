import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { registerSchema, isAdult } from "@/lib/validation/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit per IP - zapobiega masowej rejestracji/enumeracji.
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`register:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, birthDate, displayName } = parsed.data;

  if (!isAdult(birthDate)) {
    // Nie ujawniamy szczegółowo powodu odrzucenia poza komunikatem ogólnym - zgodnie
    // z zasadą minimalizacji informacji dla nieautoryzowanych żądań.
    return NextResponse.json({ error: "Rejestracja dostępna wyłącznie dla osób pełnoletnich." }, { status: 403 });
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          profile: {
            create: {
              displayName,
              birthDate,
              gender: "OTHER", // uzupełniane w kolejnym kroku onboardingu
              preference: { create: {} },
            },
          },
        },
      });
      return created;
    });

    await createSession(user.id, {
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Konto z tym adresem e-mail już istnieje." }, { status: 409 });
    }
    console.error("register_error", err);
    return NextResponse.json({ error: "Wystąpił błąd. Spróbuj ponownie później." }, { status: 500 });
  }
}
