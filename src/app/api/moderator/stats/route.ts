export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { competencies, credentials } from "@/db/schema";
import { requireRole } from "@/lib/guards";

type StatusCount = { status: string; count: number };
type MonthCount = { ym: string; count: number };
type CategoryCount = { category: string; count: number };

function lastNMonths(n: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (n - 1), 1);
  return { start, now };
}

export async function GET() {
  const auth = await requireRole(["moderator", "admin"]);
  if (auth.error) return auth.error;

  const { start, now } = lastNMonths(6);

  // 1) Credentials po statusu (pie)
  const statusCounts = await db
    .select({
      status: credentials.status,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(credentials)
    .groupBy(credentials.status);

  // 2) Broj kreiranih credentials po mesecima (line)
  // PostgreSQL: to_char(date_trunc('month', created_at), 'YYYY-MM')
  const perMonth = await db
    .select({
      ym: sql<string>`to_char(date_trunc('month', ${credentials.createdAt}), 'YYYY-MM')`,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(credentials)
    .where(sql`${credentials.createdAt} >= ${start} AND ${credentials.createdAt} <= ${now}`)
    .groupBy(sql`date_trunc('month', ${credentials.createdAt})`)
    .orderBy(sql`date_trunc('month', ${credentials.createdAt})`);

  // 3) Kompetencije po kategoriji (bar)
  const competenciesByCategory = await db
    .select({
      category: sql<string>`coalesce(${competencies.category}, 'Uncategorized')`,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(competencies)
    .groupBy(sql`coalesce(${competencies.category}, 'Uncategorized')`)
    .orderBy(sql<number>`count(*)`.mapWith(Number));

  return NextResponse.json(
    {
      statusCounts: statusCounts as StatusCount[],
      perMonth: perMonth as MonthCount[],
      competenciesByCategory: competenciesByCategory as CategoryCount[],
    },
    { status: 200 }
  );
}