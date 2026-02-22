 
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "@/db"; 
import { users } from "@/db/schema";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";

type Body = {
  name: string;
  email: string;
  password: string;
};

export async function POST(req: Request) {
  const { name, email, password } = (await req.json()) as Body;

  // Validacija
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Lozinka mora imati bar 6 karaktera" }, { status: 400 });
  }

  // Da li email već postoji?
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    return NextResponse.json({ error: "Email je već zauzet" }, { status: 409 });
  }

  // Hash
  const passHash = await bcrypt.hash(password, 10);

 
  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passHash,
      role: "user",
      isActive: true,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  // JWT
  const token = signAuthToken({
    sub: created.id,
    email: created.email,
    name: created.name ?? undefined,
    role: created.role ?? undefined,
  });

  const res = NextResponse.json(created, { status: 201 });
  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  return res;
}