import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { credentials } from "@/db/schema";
import { requireRole } from "@/lib/guards";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // params je sada Promise
) {
  const auth = await requireRole(["moderator", "admin"]);
  if (auth.error) return auth.error;

  // Moramo sačekati razrešavanje params-a pre korišćenja
  const { id } = await params; 

  try {
    const [updated] = await db
      .update(credentials)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(credentials.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Credential nije pronađen." }, { status: 404 });
    }

    return NextResponse.json({ credential: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Greška pri odobravanju." }, { status: 500 });
  }
}