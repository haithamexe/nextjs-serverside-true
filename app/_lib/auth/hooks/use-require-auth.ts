"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "../contexts/auth-context";
import type { Role } from "../auth/types";

/**
 * Redirects to /login if the user is not authenticated.
 * Optionally restricts to a specific role (redirects to /unauthorized if wrong role).
 *
 * Usage:
 *   const { user } = useRequireAuth();
 *   const { user } = useRequireAuth("admin");
 */
export function useRequireAuth(requiredRole?: Role) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, requiredRole, router]);

  return { user, isLoading };
}
