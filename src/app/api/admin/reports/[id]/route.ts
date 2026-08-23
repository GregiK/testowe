import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUserId } from "@/lib/admin";

const updateSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminUserId = await getCurrentAdminUserId();
  if (!adminUserId) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Zgłoszenie nie istnieje." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.report.update({ where: { id }, data: { status: parsed.data.status } }),
    prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: "report_status_change",
        targetType: "Report",
        targetId: id,
        metadata: JSON.stringify({ newStatus: parsed.data.status }),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
