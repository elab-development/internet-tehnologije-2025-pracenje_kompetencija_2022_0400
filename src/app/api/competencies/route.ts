import { NextResponse } from "next/server";
import { db } from "@/db";
import { competencies } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(competencies).orderBy(asc(competencies.name));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Greška pri učitavanju kompetencija." }, { status: 500 });
  }
}