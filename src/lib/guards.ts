import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken, type JwtUserClaims } from "@/lib/auth";

/**
 * Helper: izvuci userId iz JWT claim-ova.
 * Neki tokeni imaju `sub`, neki imaju `id`.
 */
export function getUserIdFromClaims(user: JwtUserClaims): string {
  const anyUser = user as unknown as { id?: string; sub?: string };
  const id = anyUser.id ?? anyUser.sub;
  if (!id) {
    throw new Error("Auth token does not contain user id (id/sub).");
  }
  return String(id);
}

/** Postojeće: za Server Components / server actions */
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

/** NOVO: za route handlers */
export async function getAuthUserFromReq(req: NextRequest): Promise<JwtUserClaims | null> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

/** Postojeće */
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, error: null };
}

/**
 * NOVO: u route handlerima koristiš ovo, i dobiješ userId već izračunat
 * (nema više user.id problema).
 */
export async function requireAuthFromReq(req: NextRequest) {
  const user = await getAuthUserFromReq(req);
  if (!user) {
    return { user: null, userId: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const userId = getUserIdFromClaims(user);
    return { user, userId, error: null };
  } catch {
    return { user: null, userId: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}

/** Postojeće */
export async function requireRole(allowed: Array<"user" | "moderator" | "admin">) {
  const { user, error } = await requireAuth();
  if (error) return { user: null, error };

  const role = ((user as any).role ?? "user") as "user" | "moderator" | "admin";
  if (!allowed.includes(role)) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, error: null };
}

/** NOVO: route handler varijanta sa userId */
export async function requireRoleFromReq(req: NextRequest, allowed: Array<"user" | "moderator" | "admin">) {
  const { user, userId, error } = await requireAuthFromReq(req);
  if (error) return { user: null, userId: null, error };

  const role = ((user as any).role ?? "user") as "user" | "moderator" | "admin";
  if (!allowed.includes(role)) {
    return { user: null, userId: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, userId, error: null };
}