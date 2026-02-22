export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/db";
import { users } from "@/db/schema";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";

type Body = {
  name: string;
  email: string;
  password: string;
};

function isPgUniqueViolation(err: any) {
  // Postgres unique violation SQLSTATE
  return err?.code === "23505";
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = (await req.json()) as Body;

    // 1) Validacija
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Lozinka mora imati bar 6 karaktera" },
        { status: 400 }
      );
    }

    // 2) Hash
    const passHash = await bcrypt.hash(password, 10);

    // 3) Insert (oslanjamo se na UNIQUE constraint na users.email)
    const [created] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
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

    if (!created) {
      return NextResponse.json({ error: "Kreiranje korisnika nije uspelo" }, { status: 500 });
    }

    // 4) JWT
    const token = signAuthToken({
      sub: created.id,
      email: created.email,
      name: created.name ?? undefined,
      role: created.role ?? undefined,
    });

    const res = NextResponse.json(created, { status: 201 });
    res.cookies.set(AUTH_COOKIE, token, cookieOpts());
    return res;
  } catch (err: any) {
    // Ako je email unique -> 409
    if (isPgUniqueViolation(err)) {
      return NextResponse.json({ error: "Email je već zauzet" }, { status: 409 });
    }

    // Ako je konekcija pukla, daj jasnu poruku (ECONNREFUSED)
    if (err?.code === "ECONNREFUSED") {
      return NextResponse.json(
        { error: "Ne mogu da se povežem na bazu (ECONNREFUSED). Proveri DATABASE_URL i da li db radi." },
        { status: 500 }
      );
    }

    console.error("REGISTER_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}