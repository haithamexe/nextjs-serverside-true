import { NextRequest, NextResponse } from "next/server";

import { loginSchema } from "../../../_lib/auth/schemas";
import { verifyPassword } from "../../../_lib/auth/password";
import {
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  signAccessToken,
  signRefreshToken,
} from "../../../_lib/auth/token";
import { findUserByEmail, toPublicUser } from "../../../_lib/auth/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const user = findUserByEmail(email);

    // Deliberately vague message to prevent user enumeration.
    const INVALID_CREDS = "Invalid email or password";

    if (!user) {
      return NextResponse.json({ error: INVALID_CREDS }, { status: 401 });
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: INVALID_CREDS }, { status: 401 });
    }

    const publicUser = toPublicUser(user);

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      signRefreshToken(user.id),
    ]);

    const response = NextResponse.json(
      { data: { accessToken, user: publicUser } },
      { status: 200 },
    );

    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: "/api/auth",
    });

    return response;
  } catch (error: unknown) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
