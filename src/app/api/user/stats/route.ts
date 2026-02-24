import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userCompetencies, credentials } from "@/db/schema";
import { getAuthUser } from "@/lib/guards";
import { eq, count } from "drizzle-orm";

export async function GET() {
  // Koristimo 'as any' da TypeScript ne pravi problem oko pristupa u.id
  const u = await getAuthUser() as any;
  if (!u || !u.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [compCount] = await db
      .select({ val: count() })
      .from(userCompetencies)
      .where(eq(userCompetencies.userId, u.id));

    const [credCount] = await db
      .select({ val: count() })
      .from(credentials)
      .where(eq(credentials.userId, u.id));

    return NextResponse.json({
      totalCompetencies: compCount.val,
      totalCredentials: credCount.val,
    });
  } catch (err) {
    return NextResponse.json({ error: "Greška pri dobavljanju statistike." }, { status: 500 });
  }
}