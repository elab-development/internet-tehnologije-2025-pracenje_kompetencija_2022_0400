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

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const { id } = await params; // OBAVEZAN AWAIT
  console.log("GET User ID:", id);

  try {
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

    if (!u) {
      return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
    }

    return NextResponse.json({ user: u });
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json({ error: "Greška pri učitavanju korisnika." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const { id } = await params; // OBAVEZAN AWAIT
  console.log("PATCH User ID:", id);

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Neispravan JSON." }, { status: 400 });
  }

  const patch: Record<string, any> = { updatedAt: new Date() };

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Ime ne može biti prazno." }, { status: 400 });
    patch.name = name;
  }

  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email ne može biti prazan." }, { status: 400 });
    patch.email = email;
  }

  if (typeof body.isActive === "boolean") {
    patch.isActive = body.isActive;
  }

  if (typeof body.role === "string") {
    if (!["user", "moderator", "admin"].includes(body.role)) {
      return NextResponse.json({ error: "Nepoznata uloga." }, { status: 400 });
    }
    patch.role = body.role;
  }

  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Lozinka mora imati minimum 6 karaktera." }, { status: 400 });
    }
    patch.passHash = await bcrypt.hash(body.password, 10);
  }

  try {
    const [updated] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!updated) {
      return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (e: any) {
    const msg = String(e?.message ?? "").toLowerCase();
    if (msg.includes("users_email_uq") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Email već postoji." }, { status: 409 });
    }
    return NextResponse.json({ error: "Greška pri izmeni korisnika." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const { id } = await params; // OBAVEZAN AWAIT
  console.log("DELETE User ID:", id);

  try {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) {
      return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Greška pri brisanju korisnika." }, { status: 500 });
  }
}