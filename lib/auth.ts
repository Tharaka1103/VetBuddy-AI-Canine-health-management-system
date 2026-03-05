import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "woofy-super-secret-key-change-in-production"
);

const TOKEN_NAME = "woofy-token";

/* ------------------------------------------------------------------ */
/*  Token helpers                                                      */
/* ------------------------------------------------------------------ */

export interface TokenPayload {
  userId: string;
  email: string;
  role: "admin" | "user";
}

/** Sign a JWT (Edge-compatible via `jose`) */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

/** Verify a JWT and return the payload */
export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Cookie helpers                                                     */
/* ------------------------------------------------------------------ */

/** Set the JWT cookie (server action / route handler) */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/** Remove the JWT cookie */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

/** Read user info from the cookie (for server components / route handlers) */
export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/* ------------------------------------------------------------------ */
/*  Middleware helper                                                   */
/* ------------------------------------------------------------------ */

/**
 * Validate the token from the request cookies (edge-compatible).
 * Returns the payload or null.
 */
export async function getSessionFromRequest(
  req: NextRequest
): Promise<TokenPayload | null> {
  const token = req.cookies.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Create a redirect response to the login page.
 */
export function redirectToLogin(req: NextRequest) {
  return NextResponse.redirect(new URL("/login", req.url));
}
