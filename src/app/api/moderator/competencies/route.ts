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

// public read (guest može da vidi)
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

// moderator/admin create
export async function POST(req: Request) {
  const { error } = await requireRole(["moderator", "admin"]);
  if (error) return error;

  const body = (await req.json()) as CreateBody;
  if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // opcionalno: proveri duplikat po name
  const [existing] = await db
    .select({ id: competencies.id })
    .from(competencies)
    .where(eq(competencies.name, body.name));

  if (existing) return NextResponse.json({ error: "Competency already exists" }, { status: 409 });

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