export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { competencies } from "@/db/schema";
import { requireRole } from "@/lib/guards";

type CreateBody = {
  name: string;
  category?: string;
  description?: string;
};

/**
 * @swagger
 * /api/competencies:
 *   get:
 *     summary: Lista kompetencija
 *     description: Javno dostupna lista svih kompetencija.
 *     tags:
 *       - Competencies
 *     responses:
 *       200:
 *         description: Lista kompetencija
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 competencies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                         nullable: true
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Greška servera
 */
export async function GET() {
  const list = await db
    .select({
      id: competencies.id,
      name: competencies.name,
      category: competencies.category,
      description: competencies.description,
      createdAt: competencies.createdAt,
    })
    .from(competencies);

  return NextResponse.json({ competencies: list });
}

/**
 * @swagger
 * /api/competencies:
 *   post:
 *     summary: Kreiranje kompetencije
 *     description: Kreira novu kompetenciju. Dostupno samo moderatoru ili adminu.
 *     tags:
 *       - Competencies
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "JavaScript"
 *               category:
 *                 type: string
 *                 example: "Programming"
 *               description:
 *                 type: string
 *                 example: "Osnovno poznavanje JavaScript jezika"
 *     responses:
 *       201:
 *         description: Uspešno kreirana kompetencija
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 competency:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     category:
 *                       type: string
 *                       nullable: true
 *                     description:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Nedostaje name
 *       409:
 *         description: Kompetencija već postoji
 *       401:
 *         description: Nije autorizovan
 *       403:
 *         description: Nema dozvolu (nije moderator/admin)
 *       500:
 *         description: Greška servera
 */
export async function POST(req: Request) {
  const { error } = await requireRole(["moderator", "admin"]);
  if (error) return error;

  const body = (await req.json()) as CreateBody;
  if (!body.name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // proveri duplikat po name
  const [existing] = await db
    .select({ id: competencies.id })
    .from(competencies)
    .where(eq(competencies.name, body.name));

  if (existing)
    return NextResponse.json(
      { error: "Competency already exists" },
      { status: 409 }
    );

  const [created] = await db
    .insert(competencies)
    .values({
      name: body.name,
      category: body.category,
      description: body.description,
      updatedAt: new Date(),
    })
    .returning({
      id: competencies.id,
      name: competencies.name,
      category: competencies.category,
      description: competencies.description,
    });

  return NextResponse.json({ competency: created }, { status: 201 });
}