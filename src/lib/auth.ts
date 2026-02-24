import * as jwt from "jsonwebtoken";
 
 
 
export const AUTH_COOKIE = "auth";

export const JWT_SECRET = (process.env.JWT_SECRET ?? "TAJNA_LOZINKA_ZA_JWT_TOKEN"); // test fallback
export const JWT_EXPIRES = (process.env.JWT_EXPIRES ?? "7d");

 

export type JwtUserClaims = {
  sub: string;
  email: string;
  name?: string;
  role?: string;
};

export function signAuthToken(claims: JwtUserClaims) {
  return jwt.sign(claims as jwt.JwtPayload, JWT_SECRET, {
    algorithm: "HS256", 
    expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAuthToken(token: string): JwtUserClaims {
  const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & JwtUserClaims;

  if (!payload?.sub || !payload?.email) {
    throw new Error("Invalid token");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
} 


export function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
