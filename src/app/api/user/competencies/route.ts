import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userCompetencies } from "@/db/schema";
import { getAuthUser } from "@/lib/guards";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const u = await getAuthUser() as any; // Privremeno 'any' da zaobiđemo JwtUserClaims grešku
  if (!u || !u.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const [inserted] = await db.insert(userCompetencies).values({
      userId: u.id, // Sada će raditi jer smo stavili 'any'
      competencyId: body.competencyId,
      level: body.level || 1,
      years: body.years || "0.0",
      isFeatured: body.isFeatured || false,
    }).returning();

    return NextResponse.json(inserted);
  } catch (err) {
    return NextResponse.json({ error: "Greška pri dodavanju kompetencije." }, { status: 400 });
  }
}