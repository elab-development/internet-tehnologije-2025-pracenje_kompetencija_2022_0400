export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { competencies } from "@/db/schema";
import { requireRole } from "@/lib/guards";

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