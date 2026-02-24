 
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";

type Body = {
  email: string;
  password: string;
};
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login korisnika
 *     description: Proverava email/lozinku, vraća korisnika i JWT token. Postavlja i auth cookie.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "secret123"
 *     responses:
 *       200:
 *         description: Uspesan login
 *         headers:
 *           Set-Cookie:
 *             description: Postavlja auth cookie sa JWT tokenom.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                   nullable: true
 *                 email:
 *                   type: string
 *                   format: email
 *                 role:
 *                   type: string
 *                   nullable: true
 *                 token:
 *                   type: string
 *               required:
 *                 - id
 *                 - email
 *                 - token
 *       401:
 *         description: Pogrešan email ili lozinka
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               required:
 *                 - error
 *       403:
 *         description: Korisnik nije aktivan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               required:
 *                 - error
 */
export async function POST(req: Request) {
  const { email, password } = (await req.json()) as Body;

  if (!email || !password) {
    return NextResponse.json({ error: "Pogrešan email ili lozinka" }, { status: 401 });
  }

  const [u] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passHash: users.passHash,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!u) {
    return NextResponse.json({ error: "Pogrešan email ili lozinka" }, { status: 401 });
  }

  if (!u.isActive) {
    return NextResponse.json({ error: "Korisnik nije aktivan" }, { status: 403 });
  }

  const ok = await bcrypt.compare(password, u.passHash);
  if (!ok) {
    return NextResponse.json({ error: "Pogrešan email ili lozinka" }, { status: 401 });
  }

  const token = signAuthToken({
    sub: u.id,
    email: u.email,
    name: u.name ?? undefined,
    role: u.role ?? undefined,
  });

  const res = NextResponse.json({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
     token,
  });

  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  return res;
}