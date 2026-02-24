import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/guards";

type PatchBody = {
  name?: string;
  email?: string;
  role?: "user" | "moderator" | "admin";
  isActive?: boolean;
  password?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Detalji korisnika
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podaci o korisniku
 *       404:
 *         description: Korisnik nije pronađen
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const { id } = await params;

  const [u] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id));

  if (!u) return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
  return NextResponse.json({ user: u });
}

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Izmena korisnika
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               role:
 *                 type: string
 *                 enum: [user, moderator, admin]
 *               isActive: { type: boolean }
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Uspešna izmena
 *       404:
 *         description: Korisnik nije pronađen
 *       409:
 *         description: Email već postoji
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const { id } = await params;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Neispravan JSON." }, { status: 400 });
  }

  const patch: Record<string, any> = { updatedAt: new Date() };

  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.email === "string") patch.email = body.email.trim().toLowerCase();
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.role === "string") patch.role = body.role;

  if (typeof body.password === "string" && body.password.length >= 6) {
    patch.passHash = await bcrypt.hash(body.password, 10);
  }

  try {
    const [updated] = await db.update(users).set(patch).where(eq(users.id, id)).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    if (!updated) return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
    return NextResponse.json({ user: updated });
  } catch (e: any) {
    const msg = String(e?.message ?? "").toLowerCase();
    if (msg.includes("users_email_uq") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Email već postoji." }, { status: 409 });
    }
    return NextResponse.json({ error: "Greška pri izmeni korisnika." }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Brisanje korisnika
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Uspešno obrisan
 *       404:
 *         description: Korisnik nije pronađen
 */
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const { id } = await params;

  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });

  if (!deleted) return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
  return NextResponse.json({ ok: true });
}