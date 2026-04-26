import { NextRequest, NextResponse } from "next/server";

import { AuthError, requireAuth } from "../../../_lib/auth/token";
import { findUserById, toPublicUser } from "../../../_lib/auth/service";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);

    const user = findUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { data: { user: toPublicUser(user) } },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
