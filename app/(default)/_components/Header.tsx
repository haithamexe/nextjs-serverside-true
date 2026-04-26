"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/_lib/contexts/auth-context";

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      <Link href="/" className="text-lg font-bold text-gray-900">
        MyApp
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <Link href="/countries" className="text-gray-600 hover:text-gray-900">
          Countries
        </Link>
        <Link href="/blog" className="text-gray-600 hover:text-gray-900">
          Blog
        </Link>

        {isLoading ? (
          <span className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-800">{user.name}</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold uppercase text-blue-700">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
