import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getDiscoveryCandidates } from "@/lib/discovery";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  const candidates = await getDiscoveryCandidates(userId);
  return NextResponse.json({ candidates });
}
