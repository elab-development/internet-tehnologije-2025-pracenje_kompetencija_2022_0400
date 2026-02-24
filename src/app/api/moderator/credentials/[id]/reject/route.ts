export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { credentials } from "@/db/schema";
import { requireRole } from "@/lib/guards";

type Body = { reason?: string };

/**
 * @swagger
 * /api/admin/credentials/{id}/reject:
 *   post:
 *     summary: Odbij credential
 *     description: Postavlja status credential-a na "rejected" i čuva razlog odbijanja. Dostupno samo moderatoru ili adminu.
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Nedostaje validna dokumentacija"
 *     responses:
 *       200:
 *         description: Credential uspešno odbijen
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
 *                       example: rejected
 *                     note:
 *                       type: string
 *                       nullable: true
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

  const body = (await req.json().catch(() => ({}))) as Body;
  const reason = (body.reason ?? "").trim() || "Odbijeno od strane moderatora";

  try {
    const [updated] = await db
      .update(credentials)
      .set({
        status: "rejected",
        note: reason,
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
      { error: "Greška pri odbijanju." },
      { status: 500 }
    );
  }
}