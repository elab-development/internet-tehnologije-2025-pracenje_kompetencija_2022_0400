import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { credentials } from "@/db/schema";
import { getAuthUser } from "@/lib/guards";

export async function POST(req: NextRequest) {
  // Forsiramo tip 'any' da zaobiđemo grešku "Property 'id' does not exist"
  const u = await getAuthUser() as any;
  if (!u || !u.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const [newCredential] = await db.insert(credentials).values({
      userId: u.id,
      type: body.type, // npr. 'certifikat', 'diploma'
      title: body.title,
      issuer: body.issuer,
      issuedAt: body.issuedAt ? new Date(body.issuedAt) : null,
      verificationUrl: body.verificationUrl,
      status: "pending", // Automatski ide na proveru kod moderatora
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newCredential);
  } catch (err) {
    return NextResponse.json({ error: "Greška pri podnošenju sertifikata." }, { status: 400 });
  }
}