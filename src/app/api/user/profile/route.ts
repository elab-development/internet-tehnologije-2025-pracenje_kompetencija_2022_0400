import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getAuthUser } from "@/lib/guards";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  const u = await getAuthUser() as any; 
  if (!u || !u.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const [updated] = await db
      .update(profiles)
      .set({
        headline: body.headline,
        bio: body.bio,
        websiteUrl: body.websiteUrl,
        linkedinUrl: body.linkedinUrl,
        githubUrl: body.githubUrl,
        isPublic: body.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, u.id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Greška pri ažuriranju profila." }, { status: 500 });
  }
}