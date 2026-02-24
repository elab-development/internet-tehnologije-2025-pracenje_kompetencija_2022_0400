import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { credentials } from "@/db/schema";
import { requireRole } from "@/lib/guards";

/**
 * @swagger
 * /api/moderator/credentials:
 * get:
 * summary: Pregled svih podnetih kredencijala
 * description: Vraca listu svih kredencijala iz baze. Dozvoljeno samo korisnicima sa ulogama 'admin' ili 'moderator'. Moguce je filtriranje prema statusu.
 * tags: [Moderator]
 * parameters:
 * - in: query
 * name: status
 * schema:
 * type: string
 * enum: [pending, active, rejected]
 * description: Opcioni filter za status kredencijala
 * responses:
 * 200:
 * description: Uspesno dobavljena lista kredencijala
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * credentials:
 * type: array
 * items:
 * $ref: '#/components/schemas/Credential'
 * 401:
 * description: Korisnik nije autentifikovan
 * 403:
 * description: Korisnik nema dozvolu (nije admin ili moderator)
 * 500:
 * description: Interna greska servera
 */

/**
 * @swagger
 * components:
 * schemas:
 * Credential:
 * type: object
 * properties:
 * id:
 * type: string
 * userId:
 * type: string
 * title:
 * type: string
 * issuer:
 * type: string
 * type:
 * type: string
 * status:
 * type: string
 * createdAt:
 * type: string
 * format: date-time
 */

export async function GET(req: NextRequest) {
  const auth = await requireRole(["moderator", "admin"]);
  if (auth.error) return auth.error;

  const status = req.nextUrl.searchParams.get("status");

  try {
    const rows = status
      ? await db
          .select()
          .from(credentials)
          .where(eq(credentials.status, status))
          .orderBy(desc(credentials.createdAt))
      : await db.select().from(credentials).orderBy(desc(credentials.createdAt));

    return NextResponse.json({ credentials: rows }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Greška pri učitavanju." }, { status: 500 });
  }
}