export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Trenutni korisnik
 *     description: Vraća trenutno ulogovanog korisnika na osnovu auth cookie (JWT). Ako nije ulogovan vraća user: null.
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Uvek vraća 200, sa user objektom ili user: null
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   oneOf:
 *                     - type: "null"
 *                     - type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           nullable: true
 *                         email:
 *                           type: string
 *                           format: email
 *                         role:
 *                           type: string
 *                           nullable: true
 *               required:
 *                 - user
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  try {
    const payload = verifyAuthToken(token);

    const [u] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, payload.sub));

    if (!u || !u.isActive) return NextResponse.json({ user: null }, { status: 200 });

    return NextResponse.json({
      user: { id: u.id, name: u.name, email: u.email, role: u.role },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}