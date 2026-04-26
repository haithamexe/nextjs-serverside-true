"use client";

import { useRequireAuth } from "@/app/_lib/auth/hooks/use-require-auth";

export default function DashboardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
