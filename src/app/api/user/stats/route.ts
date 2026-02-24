import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userCompetencies, credentials } from "@/db/schema";
import { requireAuthFromReq } from "@/lib/guards";
import { eq, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuthFromReq(req);
  if (error) return error;

  try {
    const [compCount] = await db
      .select({ val: count() })
      .from(userCompetencies)
      .where(eq(userCompetencies.userId, userId!));

    const [credCount] = await db
      .select({ val: count() })
      .from(credentials)
      .where(eq(credentials.userId, userId!));

    return NextResponse.json({
      totalCompetencies: compCount.val,
      totalCredentials: credCount.val,
    });
  } catch {
    return NextResponse.json({ error: "Greška pri dobavljanju statistike." }, { status: 500 });
  }
}