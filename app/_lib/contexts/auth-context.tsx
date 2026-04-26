"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  loginRequest,
  logoutRequest,
  persistUserToStorage,
  readUserFromStorage,
  refreshRequest,
  registerRequest,
} from "../auth/client-api";
import type { LoginPayload, PublicUser, RegisterPayload } from "../auth/types";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface AuthContextValue {
  /** Public user info (from localStorage on first paint, then confirmed by refresh). */
  user: PublicUser | null;
  /**
   * Access token stored in memory ONLY — never written to localStorage or cookies.
   * Pass this as `Authorization: Bearer <token>` to authenticated API calls.
   */
  accessToken: string | null;
  /** True while the initial session restore is in progress. */
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Returns the current access token, refreshing silently if needed.
   * Use this before making an authenticated fetch.
   */
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Seed with localStorage immediately so the UI doesn't flash on first paint.
  const [user, setUser] = useState<PublicUser | null>(readUserFromStorage);
  // Access token lives in memory only.
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent concurrent refresh calls.
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const storeAuth = useCallback((token: string, publicUser: PublicUser) => {
    setAccessToken(token);
    setUser(publicUser);
    persistUserToStorage(publicUser);
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    persistUserToStorage(null);
  }, []);

  // -------------------------------------------------------------------------
  // Silent refresh — called on mount and by getToken() when the token is gone
  // -------------------------------------------------------------------------
  const silentRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const { data } = await refreshRequest();
      storeAuth(data.accessToken, data.user);
      return data.accessToken;
    } catch {
      clearAuth();
      return null;
    }
  }, [storeAuth, clearAuth]);

  // On mount, attempt to restore the session via the HTTP-only refresh cookie.
  useEffect(() => {
    silentRefresh().finally(() => setIsLoading(false));
  }, [silentRefresh]);

  // -------------------------------------------------------------------------
  // getToken — returns a valid access token, refreshing if necessary
  // -------------------------------------------------------------------------
  const getToken = useCallback(async (): Promise<string | null> => {
    if (accessToken) return accessToken;

    // Deduplicate concurrent calls — only one refresh at a time.
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = silentRefresh().finally(() => {
        refreshPromiseRef.current = null;
      });
    }

    return refreshPromiseRef.current;
  }, [accessToken, silentRefresh]);

  // -------------------------------------------------------------------------
  // Public auth actions
  // -------------------------------------------------------------------------
  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await loginRequest(payload);
      storeAuth(data.accessToken, data.user);
    },
    [storeAuth],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await registerRequest(payload);
      storeAuth(data.accessToken, data.user);
    },
    [storeAuth],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        register,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
