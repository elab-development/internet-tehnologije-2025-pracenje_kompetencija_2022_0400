import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { credentials } from "@/db/schema";
import { requireAuthFromReq } from "@/lib/guards";
import { asc, desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuthFromReq(req);
  if (error) return error;

  try {
    const rows = await db
      .select()
      .from(credentials)
      .where(eq(credentials.userId, userId!))
      // najnovije prvo (preporuka)
      .orderBy(desc(credentials.createdAt));

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Greška pri učitavanju kredencijala." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuthFromReq(req);
  if (error) return error;

  try {
    const body = await req.json();

    const [newCredential] = await db
      .insert(credentials)
      .values({
        userId: userId!,
        type: body.type,
        title: body.title,
        issuer: body.issuer,
        issuedAt: body.issuedAt ? new Date(body.issuedAt) : null,
        verificationUrl: body.verificationUrl ?? null,
        status: "pending",
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newCredential);
  } catch {
    return NextResponse.json({ error: "Greška pri podnošenju sertifikata." }, { status: 400 });
  }
}