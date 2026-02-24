export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { competencies } from "@/db/schema";
import { asc } from "drizzle-orm";

/**
 * @swagger
 * /api/competencies:
 *   get:
 *     summary: Lista kompetencija
 *     description: Vraća sve kompetencije sortirane po nazivu (ASC).
 *     tags:
 *       - Competencies
 *     responses:
 *       200:
 *         description: Lista kompetencija
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                     nullable: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Greška servera
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               required:
 *                 - error
 */
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(competencies)
      .orderBy(asc(competencies.name));

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { error: "Greška pri učitavanju kompetencija." },
      { status: 500 }
    );
  }
}