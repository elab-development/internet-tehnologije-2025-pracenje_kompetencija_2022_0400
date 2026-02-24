import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { credentials } from "@/db/schema";
import { requireAuthFromReq } from "@/lib/guards";
import { asc, desc, eq } from "drizzle-orm";

/**
 * @swagger
 * /api/user/credentials:
 * get:
 * summary: Pregled ličnih sertifikata korisnika
 * description: Vraća listu svih sertifikata i diploma koje je trenutno prijavljeni korisnik podneo, sortirane od najnovijih ka starijima.
 * tags: [User Credentials]
 * responses:
 * 200:
 * description: Lista sertifikata uspešno dobavljena.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Credential'
 * 401:
 * description: Korisnik nije autentifikovan.
 * 500:
 * description: Greška na serveru.
 *
 * post:
 * summary: Podnošenje novog sertifikata na verifikaciju
 * description: Omogućava korisniku da pošalje podatke o novom sertifikatu. Status se automatski postavlja na 'pending'.
 * tags: [User Credentials]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - type
 * - title
 * - issuer
 * properties:
 * type:
 * type: string
 * example: "Diploma"
 * title:
 * type: string
 * example: "Master Software Engineering"
 * issuer:
 * type: string
 * example: "Univerzitet u Beogradu"
 * issuedAt:
 * type: string
 * format: date
 * example: "2023-10-15"
 * verificationUrl:
 * type: string
 * example: "https://verify.edu/123"
 * responses:
 * 200:
 * description: Sertifikat uspešno podnet.
 * 400:
 * description: Nevalidni podaci u zahtevu.
 */

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuthFromReq(req);
  if (error) return error;

  try {
    const rows = await db
      .select()
      .from(credentials)
      .where(eq(credentials.userId, userId!))
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