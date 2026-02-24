export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout korisnika
 *     description: Briše auth cookie i odjavljuje korisnika.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Uspešan logout
 *         headers:
 *           Set-Cookie:
 *             description: Briše auth cookie.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *               required:
 *                 - ok
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}