export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userCompetencies, credentials } from "@/db/schema";
import { requireAuthFromReq } from "@/lib/guards";
import { eq, count } from "drizzle-orm";

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: Statistika trenutnog korisnika
 *     description: Vraća ukupan broj kompetencija i credential-a za trenutno ulogovanog korisnika.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Uspešno vraćena statistika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCompetencies:
 *                   type: integer
 *                   example: 5
 *                 totalCredentials:
 *                   type: integer
 *                   example: 2
 *               required:
 *                 - totalCompetencies
 *                 - totalCredentials
 *       401:
 *         description: Nije autorizovan
 *       500:
 *         description: Greška servera
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuthFromReq(req);
  if (error) return error;

  try {
    const [compCount] = await db
      .select({ val: count() })
      .from(userCompetencies)
      .where(eq(userCompetencies.userId, userId!));

    const [credCount] = await db
      .select({ val: count() })
      .from(credentials)
      .where(eq(credentials.userId, userId!));

    return NextResponse.json({
      totalCompetencies: compCount.val,
      totalCredentials: credCount.val,
    });
  } catch {
    return NextResponse.json(
      { error: "Greška pri dobavljanju statistike." },
      { status: 500 }
    );
  }
}