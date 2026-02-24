import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireAuthFromReq } from "@/lib/guards";
import { eq } from "drizzle-orm";

function emptyToNull(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function toBool(v: unknown): boolean | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.toLowerCase().trim();
    if (s === "true" || s === "1" || s === "on" || s === "yes") return true;
    if (s === "false" || s === "0" || s === "off" || s === "no") return false;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuthFromReq(req);
  if (error) return error;

  try {
    const rows = await db.select().from(profiles).where(eq(profiles.userId, userId!));
    return NextResponse.json(rows[0] ?? null);
  } catch {
    return NextResponse.json({ error: "Greška pri učitavanju profila." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuthFromReq(req);
  if (error) return error;

  try {
    const body = await req.json();

    // Samo setuj polja koja su stvarno poslata u body
    const patch: Record<string, any> = { updatedAt: new Date() };

    if ("headline" in body) patch.headline = emptyToNull(body.headline);
    if ("bio" in body) patch.bio = emptyToNull(body.bio);
    if ("linkedinUrl" in body) patch.linkedinUrl = emptyToNull(body.linkedinUrl);
    if ("githubUrl" in body) patch.githubUrl = emptyToNull(body.githubUrl);

    if ("websiteUrl" in body) patch.websiteUrl = emptyToNull(body.websiteUrl);
    if ("isPublic" in body) patch.isPublic = toBool(body.isPublic);

    const updatedRows = await db
      .update(profiles)
      .set(patch)
      .where(eq(profiles.userId, userId!))
      .returning();

    if (!updatedRows || updatedRows.length === 0) {
      const insertedRows = await db
        .insert(profiles)
        .values({ userId: userId!, ...patch } as any)
        .returning();

      return NextResponse.json(insertedRows[0] ?? null);
    }

    return NextResponse.json(updatedRows[0]);
  } catch (err) {
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json(
      {
        error: "Greška pri ažuriranju profila.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}