import { NextRequest, NextResponse } from "next/server";

import { registerSchema } from "../../../_lib/auth/schemas";
import { hashPassword } from "../../../_lib/auth/password";
import {
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  signAccessToken,
  signRefreshToken,
} from "../../../_lib/auth/token";
import {
  createUser,
  findUserByEmail,
  toPublicUser,
} from "../../../_lib/auth/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 },
      );
    }

    const { email, password, name, role } = parsed.data;

    if (findUserByEmail(email)) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = createUser({ email, name, role, passwordHash });
    const publicUser = toPublicUser(user);

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      signRefreshToken(user.id),
    ]);

    const response = NextResponse.json(
      { data: { accessToken, user: publicUser } },
      { status: 201 },
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
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
