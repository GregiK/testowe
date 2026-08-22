import { PrismaClient } from "@prisma/client";

// Standardowy singleton Prisma dla środowiska dev (unika wyczerpania connection poola
// przy hot-reload Next.js). W produkcji (jeden proces Passenger) tworzony jest raz.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
