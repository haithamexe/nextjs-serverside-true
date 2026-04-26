import { NextRequest, NextResponse } from "next/server";

import {
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../_lib/auth/token";
import { findUserById, toPublicUser } from "../../../_lib/auth/service";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token — please log in again" },
        { status: 401 },
      );
    }

    let payload;
    try {
      payload = await verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json(
        { error: "Refresh token is expired or invalid" },
        { status: 401 },
      );
    }

    const user = findUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const publicUser = toPublicUser(user);

    // Rotate both tokens on every refresh (refresh token rotation).
    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      signRefreshToken(user.id),
    ]);

    const response = NextResponse.json(
      { data: { accessToken: newAccessToken, user: publicUser } },
      { status: 200 },
    );

    response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: "/api/auth",
    });

    return response;
  } catch (error: unknown) {
    console.error("POST /api/auth/refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
