import { NextResponse } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "../../../_lib/auth/token";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 },
  );

  // Clear the refresh token cookie by setting maxAge to 0.
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/api/auth",
  });

  return response;
}
