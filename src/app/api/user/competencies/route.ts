import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { competencies, userCompetencies } from "@/db/schema";
import { requireAuthFromReq } from "@/lib/guards";
import { and, asc, eq } from "drizzle-orm";

/**
 * @swagger
 * /api/user/competencies:
 * get:
 * summary: Pregled ličnih kompetencija korisnika
 * description: Vraća listu svih kompetencija koje je trenutno prijavljeni korisnik dodao na svoj profil, uključujući nivo i godine iskustva.
 * tags: [User Competencies]
 * responses:
 * 200:
 * description: Lista korisničkih kompetencija uspešno dobavljena.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * competencyId: { type: string }
 * level: { type: number }
 * years: { type: string }
 * isFeatured: { type: boolean }
 * competency:
 * type: object
 * properties:
 * name: { type: string }
 * 401:
 * description: Neautorizovan pristup (JWT token nedostaje ili je nevažeći).
 * 500:
 * description: Interna greška servera pri učitavanju.
 *
 * post:
 * summary: Dodavanje nove kompetencije na profil
 * description: Omogućava korisniku da doda novu veštinu u svoj portfolio. Sistem proverava da li veština već postoji na profilu.
 * tags: [User Competencies]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - competencyId
 * properties:
 * competencyId: { type: string, description: "ID postojeće kompetencije iz baze" }
 * level: { type: number, default: 1, minimum: 1, maximum: 5 }
 * years: { type: string, default: "0.0" }
 * isFeatured: { type: boolean, default: false }
 * responses:
 * 200:
 * description: Kompetencija uspešno dodata na profil.
 * 400:
 * description: Nevalidni ulazni podaci (npr. nedostaje competencyId).
 * 409:
 * description: Konflikt - korisnik već ima ovu kompetenciju na profilu.
 */

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuthFromReq(req);
  if (error) return error;

  try {
    const rows = await db
      .select({
        competencyId: userCompetencies.competencyId,
        level: userCompetencies.level,
        years: userCompetencies.years,
        isFeatured: userCompetencies.isFeatured,
        competency: {
          name: competencies.name,
        },
      })
      .from(userCompetencies)
      .leftJoin(competencies, eq(userCompetencies.competencyId, competencies.id))
      .where(eq(userCompetencies.userId, userId!))
      .orderBy(asc(competencies.name));

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Greška pri učitavanju korisničkih kompetencija." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuthFromReq(req);
  if (error) return error;

  try {
    const body = await req.json();

    const competencyId = String(body.competencyId || "");
    if (!competencyId) {
      return NextResponse.json({ error: "competencyId je obavezan." }, { status: 400 });
    }

    const existing = await db
      .select({ competencyId: userCompetencies.competencyId })
      .from(userCompetencies)
      .where(and(eq(userCompetencies.userId, userId!), eq(userCompetencies.competencyId, competencyId)));

    if (existing.length > 0) {
      return NextResponse.json({ error: "Već imate dodatu ovu kompetenciju." }, { status: 409 });
    }

    const [inserted] = await db
      .insert(userCompetencies)
      .values({
        userId: userId!,
        competencyId,
        level: Number(body.level) || 1,
        years: String(body.years || "0.0"),
        isFeatured: Boolean(body.isFeatured) || false,
      })
      .returning({
        competencyId: userCompetencies.competencyId,
        level: userCompetencies.level,
        years: userCompetencies.years,
        isFeatured: userCompetencies.isFeatured,
      });

    return NextResponse.json(inserted);
  } catch {
    return NextResponse.json({ error: "Greška pri dodavanju kompetencije." }, { status: 400 });
  }
}