import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken, type JwtUserClaims } from "@/lib/auth";

export async function getAuthUser(): Promise<JwtUserClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, error: null };
}

export async function requireRole(allowed: Array<"user" | "moderator" | "admin">) {
  const { user, error } = await requireAuth();
  if (error) return { user: null, error };

  const role = (user!.role ?? "user") as "user" | "moderator" | "admin";
  if (!allowed.includes(role)) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user: user!, error: null };
}