import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "home-session";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const existingSessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionId = existingSessionId ?? crypto.randomUUID();

  requestHeaders.set("x-home-authenticated", "true");
  requestHeaders.set("x-home-session-id", sessionId);
  requestHeaders.set("x-home-request-id", crypto.randomUUID());

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!existingSessionId) {
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
