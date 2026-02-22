export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/guards";

export async function GET() {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const list = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users);

  return NextResponse.json({ users: list });
}