import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

// Zwraca userId wyłącznie jeśli zalogowany użytkownik ma flagę isAdmin - wszystkie
// endpointy/strony panelu administratora muszą przejść przez tę funkcję zamiast samego
// getCurrentUserId, żeby uniknąć przypadkowego dopuszczenia zwykłego konta do RBAC.
export async function getCurrentAdminUserId(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null, isActive: true },
    select: { isAdmin: true },
  });

  return user?.isAdmin ? userId : null;
}
