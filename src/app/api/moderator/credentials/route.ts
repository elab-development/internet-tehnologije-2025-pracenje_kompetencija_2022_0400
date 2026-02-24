import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { credentials } from "@/db/schema";
import { requireRole } from "@/lib/guards";

export async function GET(req: NextRequest) {
  const auth = await requireRole(["moderator", "admin"]);
  if (auth.error) return auth.error;

  const status = req.nextUrl.searchParams.get("status");

  try {
    const rows = status
      ? await db
          .select()
          .from(credentials)
          .where(eq(credentials.status, status))
          .orderBy(desc(credentials.createdAt))
      : await db.select().from(credentials).orderBy(desc(credentials.createdAt));

    return NextResponse.json({ credentials: rows }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Greška pri učitavanju." }, { status: 500 });
  }
}