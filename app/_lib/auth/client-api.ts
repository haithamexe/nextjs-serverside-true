import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "../auth/types";

const AUTH_BASE = "/api/auth";

// ---------------------------------------------------------------------------
// Shared fetch wrapper — throws with the server's error message on failure
// ---------------------------------------------------------------------------
async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${AUTH_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      (body as { error?: string }).error ?? "Auth request failed",
    );
  }

  return body as T;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export function loginRequest(payload: LoginPayload) {
  return authFetch<{ data: AuthResponse }>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerRequest(payload: RegisterPayload) {
  return authFetch<{ data: AuthResponse }>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Uses the HTTP-only refresh token cookie automatically (no body needed).
 * Returns a new access token + public user, or throws if the session expired.
 */
export function refreshRequest() {
  return authFetch<{ data: AuthResponse }>("/refresh", { method: "POST" });
}

export function logoutRequest() {
  return authFetch<{ message: string }>("/logout", { method: "POST" });
}

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------
// We persist ONLY non-sensitive public user data so the UI can hydrate
// instantly without waiting for the token refresh round-trip.
// The access token is NEVER written here.
// ---------------------------------------------------------------------------

const LS_USER_KEY = "auth_user";

export function persistUserToStorage(user: AuthResponse["user"] | null): void {
  if (typeof window === "undefined") return;
  if (user === null) {
    localStorage.removeItem(LS_USER_KEY);
  } else {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  }
}

export function readUserFromStorage(): AuthResponse["user"] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse["user"]) : null;
  } catch {
    return null;
  }
}
