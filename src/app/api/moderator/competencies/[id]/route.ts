export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { competencies } from "@/db/schema";
import { requireRole } from "@/lib/guards";

/**
 * @swagger
 * /api/competencies/{id}:
 * patch:
 * summary: Azuriranje postojece kompetencije
 * description: Dozvoljava korisnicima sa ulogom 'admin' ili 'moderator' da izmene polja kompetencije.
 * tags: [Competencies]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: UUID kompetencije
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * category:
 * type: string
 * description:
 * type: string
 * responses:
 * 200:
 * description: Kompetencija uspesno azurirana
 * 401:
 * description: Neautorizovan pristup
 * 404:
 * description: Kompetencija nije pronadjena
 *
 * delete:
 * summary: Brisanje kompetencije
 * description: Trajno uklanja kompetenciju iz sistema (Admin/Moderator).
 * tags: [Competencies]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Uspesno obrisano
 * 404:
 * description: Nije pronadjeno
 */

type PatchBody = {
  name?: string;
  category?: string;
  description?: string;
};

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { error } = await requireRole(["moderator", "admin"]);
  if (error) return error;

  const { id } = await params;

  const body = (await req.json()) as PatchBody;

  const [updated] = await db
    .update(competencies)
    .set({
      name: body.name,
      category: body.category,
      description: body.description,
      updatedAt: new Date(),
    })
    .where(eq(competencies.id, id))
    .returning({
      id: competencies.id,
      name: competencies.name,
      category: competencies.category,
      description: competencies.description,
    });

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ competency: updated });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { error } = await requireRole(["moderator", "admin"]);
  if (error) return error;

  const { id } = await params;

  const [deleted] = await db
    .delete(competencies)
    .where(eq(competencies.id, id))
    .returning({ id: competencies.id });

  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}