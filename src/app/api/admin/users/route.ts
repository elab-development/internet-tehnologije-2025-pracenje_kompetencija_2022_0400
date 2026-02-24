import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/guards";

type CreateBody = {
  name: string;
  email: string;
  password: string;
  role?: "user" | "moderator" | "admin";
  isActive?: boolean;
};

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lista korisnika
 *     description: Vraća listu korisnika. Dostupno samo adminu.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Pretraga po imenu ili emailu
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, moderator, admin]
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Lista korisnika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       name: { type: string }
 *                       email: { type: string }
 *                       role: { type: string }
 *                       isActive: { type: boolean }
 *                       createdAt: { type: string, format: date-time }
 *                       updatedAt: { type: string, format: date-time }
 *       500:
 *         description: Greška servera
 */
export async function GET(req: NextRequest) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const url = req.nextUrl;

  const q = (url.searchParams.get("q") ?? "").trim();
  const role = (url.searchParams.get("role") ?? "").trim() as "" | "user" | "moderator" | "admin";
  const activeParam = (url.searchParams.get("active") ?? "").trim();

  const whereParts: any[] = [];

  if (role) whereParts.push(eq(users.role, role));
  if (activeParam === "true") whereParts.push(eq(users.isActive, true));
  if (activeParam === "false") whereParts.push(eq(users.isActive, false));

  if (q) {
    whereParts.push(
      sql`(${users.name} ILIKE ${"%" + q + "%"} OR ${users.email} ILIKE ${"%" + q + "%"})`
    );
  }

  try {
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    if (whereParts.length) query = query.where(and(...whereParts)) as any;

    const rows = await query.orderBy(desc(users.createdAt));
    return NextResponse.json({ users: rows });
  } catch {
    return NextResponse.json({ error: "Greška pri učitavanju korisnika." }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Kreiraj korisnika
 *     description: Kreira novog korisnika. Samo admin.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Pera Perić" }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               role:
 *                 type: string
 *                 enum: [user, moderator, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Kreiran korisnik
 *       400:
 *         description: Validaciona greška
 *       409:
 *         description: Email već postoji
 *       500:
 *         description: Greška servera
 */
export async function POST(req: NextRequest) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Neispravan JSON." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const role = (body.role ?? "user") as "user" | "moderator" | "admin";
  const isActive = body.isActive ?? true;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email i password su obavezni." }, { status: 400 });
  }

  if (!["user", "moderator", "admin"].includes(role)) {
    return NextResponse.json({ error: "Nepoznata uloga." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Lozinka mora imati minimum 6 karaktera." }, { status: 400 });
  }

  const passHash = await bcrypt.hash(password, 10);

  try {
    const [created] = await db.insert(users).values({
      name,
      email,
      passHash,
      role,
      isActive,
      updatedAt: new Date(),
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (e: any) {
    const msg = String(e?.message ?? "").toLowerCase();
    if (msg.includes("users_email_uq") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Email već postoji." }, { status: 409 });
    }
    return NextResponse.json({ error: "Greška pri kreiranju korisnika." }, { status: 500 });
  }
}