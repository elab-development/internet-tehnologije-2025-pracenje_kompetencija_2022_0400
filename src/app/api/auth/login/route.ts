 
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
  });

  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  return res;
}