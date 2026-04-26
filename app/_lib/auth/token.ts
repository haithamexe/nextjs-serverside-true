import "server-only";

import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

import type { AccessTokenPayload, RefreshTokenPayload, Role } from "./types";

// ---------------------------------------------------------------------------
// Secrets — set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env.local
// ---------------------------------------------------------------------------
function getSecret(envVar: string, fallback: string): Uint8Array {
  const value = process.env[envVar];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required env var: ${envVar}`);
  }
  return new TextEncoder().encode(value ?? fallback);
}

const ACCESS_SECRET = getSecret(
  "JWT_ACCESS_SECRET",
  "dev-access-secret-change-in-production",
);
const REFRESH_SECRET = getSecret(
  "JWT_REFRESH_SECRET",
  "dev-refresh-secret-change-in-production",
);

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL = "7d";
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// ---------------------------------------------------------------------------
// Sign
// ---------------------------------------------------------------------------
export async function signAccessToken(
  payload: Omit<AccessTokenPayload, "type">,
): Promise<string> {
  return new SignJWT({ ...payload, type: "access" } as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(sub: string): Promise<string> {
  return new SignJWT({ sub, type: "refresh" } as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(REFRESH_SECRET);
}

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------
export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return payload as unknown as AccessTokenPayload;
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, REFRESH_SECRET);
  return payload as unknown as RefreshTokenPayload;
}

// ---------------------------------------------------------------------------
// Request helpers — used in API route handlers
// ---------------------------------------------------------------------------

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * Throws if the header is missing, malformed, or the token is invalid.
 */
export async function requireAuth(
  request: NextRequest,
): Promise<AccessTokenPayload> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid Authorization header", 401);
  }
  try {
    return await verifyAccessToken(auth.slice(7));
  } catch {
    throw new AuthError("Access token is expired or invalid", 401);
  }
}

/**
 * Like requireAuth, but also asserts the caller has the required role.
 */
export async function requireRole(
  request: NextRequest,
  role: Role,
): Promise<AccessTokenPayload> {
  const payload = await requireAuth(request);
  if (payload.role !== role) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return payload;
}

// ---------------------------------------------------------------------------
// Typed auth error
// ---------------------------------------------------------------------------
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 401 | 403 = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
