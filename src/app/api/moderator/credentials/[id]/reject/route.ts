import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { credentials } from "@/db/schema";
import { requireRole } from "@/lib/guards";

type Body = { reason?: string };

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(["moderator", "admin"]);
  if (auth.error) return auth.error;

  const id = params.id;
  const body = (await req.json().catch(() => ({}))) as Body;

  const reason = (body.reason ?? "").trim() || "Odbijeno od strane moderatora";

  try {
    const [updated] = await db
      .update(credentials)
      .set({
        status: "rejected",
        note: reason,
        updatedAt: new Date(),
      })
      .where(eq(credentials.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Credential nije pronađen." }, { status: 404 });
    }

    return NextResponse.json({ credential: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Greška pri odbijanju." }, { status: 500 });
  }
}