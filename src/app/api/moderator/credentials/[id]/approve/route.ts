export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { credentials } from "@/db/schema";
import { requireRole } from "@/lib/guards";

/**
 * @swagger
 * /api/admin/credentials/{id}/approve:
 *   post:
 *     summary: Odobri credential
 *     description: Postavlja status credential-a na "active". Dostupno samo moderatoru ili adminu.
 *     tags:
 *       - Credentials
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID credential-a
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credential uspešno odobren
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 credential:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: active
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Nije autorizovan
 *       403:
 *         description: Nema dozvolu (nije moderator/admin)
 *       404:
 *         description: Credential nije pronađen
 *       500:
 *         description: Greška servera
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["moderator", "admin"]);
  if (auth.error) return auth.error;

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
      return NextResponse.json(
        { error: "Credential nije pronađen." },
        { status: 404 }
      );
    }

    return NextResponse.json({ credential: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Greška pri odobravanju." },
      { status: 500 }
    );
  }
}