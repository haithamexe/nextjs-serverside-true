# Next.js Production Template — AI Build Guide

This document is a complete specification for generating a clean, production-ready Next.js
boilerplate from scratch. Feed it to an AI agent and it will produce every file in the correct
order with no placeholders, no in-memory stubs, no dead folders, and no extra abstraction loops.

---

## Stack

| Concern              | Package                                  | Why                                                             |
| -------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| Framework            | `next` (latest App Router)               | Server components, route groups, built-in API routes            |
| Language             | `typescript` strict                      | End-to-end type safety                                          |
| Styling              | `tailwindcss` v4 + `shadcn/ui`           | Utility CSS + accessible, unstyled component primitives         |
| Validation           | `zod` v4                                 | Runtime type guards at every system boundary                    |
| Env validation       | `@t3-oss/env-nextjs`                     | Fails the build if required env vars are missing                |
| ORM                  | `prisma` + `@prisma/client`              | Type-safe DB layer; replaces in-memory Map from the demo        |
| Database             | PostgreSQL (dev: `DATABASE_URL` in .env) | Real persistence; swap to SQLite for local-only work            |
| Auth tokens          | `jose` (HS256)                           | Access token in React memory; refresh token in HTTP-only cookie |
| Password hashing     | `bcryptjs` + `@types/bcryptjs`           | 12 salt rounds                                                  |
| Client data fetching | `@tanstack/react-query` v5               | Replaces raw `useEffect` + manual loading/error state           |
| HTTP client          | native `fetch`                           | Built into Node 18+ and browsers; no extra dependency           |
| Linting              | `eslint` + `@eslint/eslintrc`            | Standard rules + Next.js plugin                                 |
| Formatting           | `prettier`                               | Consistent code style                                           |

---

## What This Template Does NOT Include

Remove these patterns from any existing project before generating the template:

- `x-home-authenticated: "true"` hardcoded in middleware — replace with real JWT cookie check
- In-memory `Map<string, User>` user store — replace with Prisma
- Empty folders (`app/utils/`, `app/_lib/lib/`, `app/(default)/_home/`) — delete them
- `app/_lib/environments.ts` with `testValue` — replace with `@t3-oss/env-nextjs`
- Raw `useEffect` + manual `isMounted` guard in hooks — replace with TanStack Query
- Duplicate `home/` folder inside `(default)/` and `(default)/_home/` — keep only the routable one
- `console.log` debugging statements in route handlers
- `assertProxyGuard` checking headers that are always `"true"` — proxy should check the actual auth cookie

---

## Required Environment Variables

Create `.env.local` with all of these. The build fails without them (enforced by `@t3-oss/env-nextjs`).

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"

# JWT secrets — generate with: openssl rand -base64 32
JWT_ACCESS_SECRET="<32-byte-random-string>"
JWT_REFRESH_SECRET="<32-byte-random-string>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## Clean Folder Structure

```text
app/
  layout.tsx                         # Root — wraps app in <Providers> (QueryClient + AuthProvider)
  globals.css
  favicon.ico

  (auth)/                            # Route group — centered card layout
    layout.tsx
    login/
      page.tsx
      _components/
        LoginForm.tsx                # "use client" — calls loginRequest, stores token via context
    register/
      page.tsx
      _components/
        RegisterForm.tsx             # "use client" — calls registerRequest

  (dashboard)/                       # Route group — sidebar layout, auth-guarded
    layout.tsx                       # Wraps children in <DashboardGuard>
    _components/
      DashboardGuard.tsx             # "use client" — redirects to /login if no valid session
      DashboardSidebar.tsx           # "use client" — nav links, logout button
      DashboardNav.tsx               # "use client" — mobile top bar
    dashboard/
      page.tsx
      loading.tsx
      error.tsx
      profile/
        page.tsx
        loading.tsx
      settings/
        page.tsx
        loading.tsx

  (default)/                         # Route group — public, Header/Footer layout
    layout.tsx
    page.tsx                         # / -> renders <HomePage />
    _components/
      Header.tsx                     # "use client" — shows user name + logout
      Footer.tsx
    home/
      page.tsx                       # /home -> renders <HomePageContent />
      loading.tsx
      error.tsx
      _components/
        HomePageContent.tsx          # async server component — fetches via server-api
        HomePageList.tsx             # "use client" — optimistic list + delete via useMutation
    blog/
      page.tsx                       # /blog -> renders <BlogList />
      loading.tsx
      error.tsx
      _components/
        BlogList.tsx                 # async server component
      [slug]/
        page.tsx
        loading.tsx
        error.tsx
        _components/
          PostDetail.tsx             # async server component
    countries/
      page.tsx                       # /countries -> renders <CountriesList />
      loading.tsx
      error.tsx
      _components/
        CountriesList.tsx            # async server component
      [countryCode]/
        page.tsx
        loading.tsx
        error.tsx
        _components/
          CountryDetail.tsx          # async server component
    unauthorized/
      page.tsx

  api/
    home/
      route.ts                       # GET POST PUT DELETE — Zod validated, calls home service
    blog/
      route.ts                       # GET POST
      [slug]/
        route.ts                     # GET PUT DELETE
    countries/
      route.ts                       # GET
      [countryCode]/
        route.ts                     # GET DELETE
    auth/
      register/
        route.ts
      login/
        route.ts
      refresh/
        route.ts
      logout/
        route.ts
      me/
        route.ts

  _lib/                              # Private — not a route
    env.ts                           # @t3-oss/env-nextjs schema — single source of truth for env vars
    db.ts                            # Prisma singleton client
    contexts/
      auth-context.tsx               # Access token in React state; silentRefresh on mount
      query-provider.tsx             # TanStack QueryClient wrapper
    auth/
      types.ts
      schemas.ts
      password.ts                    # server-only — bcryptjs
      token.ts                       # server-only — jose sign/verify, requireAuth, requireRole
      service.ts                     # server-only — Prisma CRUD, replaces in-memory Map
      client-api.ts
      hooks/
        use-require-auth.ts
        use-auth-mutations.ts        # useMutation wrappers for login/register/logout
    home/
      types.ts
      schemas.ts
      service.ts                     # server-only — external API
      server-api.ts                  # server-only — calls internal /api/home
      client-api.ts
      hooks/
        use-home-data.ts             # useQuery for list
        use-home-mutations.ts        # useMutation for create/update/delete
    blog/
      types.ts
      schemas.ts
      service.ts                     # server-only
      server-api.ts                  # server-only
      client-api.ts
      hooks/
        use-blog-posts.ts
        use-blog-post.ts
        use-blog-mutations.ts
    countries/
      types.ts
      schemas.ts
      service.ts                     # server-only
      server-api.ts                  # server-only
      client-api.ts
      hooks/
        use-countries.ts
        use-country.ts

middleware.ts                        # Real auth check — reads refresh cookie, stamps headers
next.config.ts                       # Image remote patterns, strict mode
prisma/
  schema.prisma                      # User model + any feature models
```

---

## Env Validation — `app/_lib/env.ts`

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

Import `env.DATABASE_URL` everywhere instead of `process.env.DATABASE_URL` directly.

---

## Prisma Singleton — `app/_lib/db.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

---

## Prisma Schema — `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String
  role         Role     @default(user)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role {
  admin
  user
}
```

---

## Auth Service — `app/_lib/auth/service.ts`

Replaces the in-memory Map completely. Every function is a Prisma query.

```typescript
import "server-only";

import { db } from "@/app/_lib/db";
import type { Role } from "@prisma/client";

import { hashPassword } from "./password";
import type { PublicUser } from "./types";

export async function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function findUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function createUser(data: {
  email: string;
  name: string;
  role: Role;
  password: string;
}) {
  const passwordHash = await hashPassword(data.password);
  return db.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      role: data.role,
      passwordHash,
    },
  });
}

export function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}
```

---

## Middleware — `middleware.ts`

Replaces the proxy that stamped `x-home-authenticated: "true"` unconditionally.
The real version reads the refresh cookie and stamps the actual user ID.

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-in-production",
);

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const requestId = crypto.randomUUID();

  requestHeaders.set("x-request-id", requestId);

  const refreshToken = request.cookies.get("refresh_token")?.value;
  let userId: string | null = null;

  if (refreshToken) {
    try {
      const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
      userId = (payload.sub as string) ?? null;
    } catch {
      // expired or invalid — treat as unauthenticated
    }
  }

  requestHeaders.set("x-authenticated", userId ? "true" : "false");
  if (userId) requestHeaders.set("x-user-id", userId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/api/:path*", "/(dashboard)/:path*"],
};
```

---

## TanStack Query Providers — `app/_lib/contexts/query-provider.tsx`

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### Root Layout — `app/layout.tsx`

```typescript
import { AuthProvider } from "@/app/_lib/contexts/auth-context";
import { QueryProvider } from "@/app/_lib/contexts/query-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## Client Data Hooks Pattern (TanStack Query)

Replace every `useEffect` + `isMounted` guard with the TanStack pattern.

### List hook example — `app/_lib/blog/hooks/use-blog-posts.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

import { getBlogPosts } from "../client-api";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: getBlogPosts,
  });
}
```

### Single item hook — `app/_lib/blog/hooks/use-blog-post.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

import { getBlogPost } from "../client-api";

export function useBlogPost(id: number) {
  return useQuery({
    queryKey: ["blog-post", id],
    queryFn: () => getBlogPost(id),
    enabled: id > 0,
  });
}
```

### Mutation hook — `app/_lib/blog/hooks/use-blog-mutations.ts`

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBlogPost, deleteBlogPost, updateBlogPost } from "../client-api";

export function useBlogMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["blog-posts"] });

  const create = useMutation({
    mutationFn: createBlogPost,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: updateBlogPost,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
```

### Optimistic delete — client list component

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteHomePost } from "@/app/_lib/home/client-api";
import type { HomeTodo } from "@/app/_lib/home/types";

export function HomePageList({ initialData }: { initialData: HomeTodo[] }) {
  const queryClient = useQueryClient();

  const { mutate: remove } = useMutation({
    mutationFn: deleteHomePost,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["home-todos"] });
      const previous = queryClient.getQueryData<HomeTodo[]>(["home-todos"]);
      queryClient.setQueryData<HomeTodo[]>(
        ["home-todos"],
        (old) => old?.filter((t) => t.cca3 !== id) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["home-todos"], ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["home-todos"] }),
  });

  // render list using `remove(item.cca3)` on delete button
}
```

---

## Server API Pattern (unchanged from current project)

This layer is correct. Keep it exactly as-is for all features.

```typescript
// app/_lib/[feature]/server-api.ts
import "server-only";

import { headers } from "next/headers";

async function getBaseUrl() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host) throw new Error("Missing host header for internal API request");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

async function requestInternalApi<T>(
  feature: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const requestHeaders = await headers();
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/${feature}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      cookie: requestHeaders.get("cookie") ?? "",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok)
    throw new Error(payload.error || "Internal API request failed");
  return payload.data as T;
}

export const getBlogPostsFromApi = () =>
  requestInternalApi<BlogPost[]>("blog", "");

export const getBlogPostFromApi = (id: number) =>
  requestInternalApi<BlogPost>("blog", `/${id}`);
```

---

## Route Handler Pattern

Every route handler follows this exact structure. No console.log, no test values.

```typescript
// app/api/[feature]/route.ts
import { type NextRequest, NextResponse } from "next/server";

import { featureSchema } from "@/app/_lib/[feature]/schemas";
import { getItems, createItem } from "@/app/_lib/[feature]/service";

function errorResponse(error: unknown, status = 500) {
  const message =
    error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const data = await getItems();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = featureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const data = await createItem(parsed.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
```

---

## Auth Route Handlers (keep, they are correct)

The four auth routes (`register`, `login`, `refresh`, `logout`, `me`) from the current
project are production-ready once the service layer points to Prisma instead of the in-memory
Map. No other changes needed.

Key details to preserve:

- `login/route.ts`: Zod `loginSchema` -> `verifyPassword` -> `signAccessToken` + `signRefreshToken` -> `Set-Cookie: refresh_token; HttpOnly; SameSite=lax; Path=/api/auth`
- `register/route.ts`: Zod `registerSchema` -> `createUser` (Prisma) -> same token flow
- `refresh/route.ts`: reads `refresh_token` cookie -> `verifyRefreshToken` -> issues new pair (rotation)
- `logout/route.ts`: clears cookie with `maxAge: 0`
- `me/route.ts`: `requireAuth(request)` -> `findUserById` -> return `PublicUser`

---

## Error and Loading Files

Add these next to every `page.tsx`. They are automatic — Next.js picks them up.

### `loading.tsx` (per route segment)

```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
```

### `error.tsx` (per route segment)

```typescript
"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <p className="text-destructive">Something went wrong.</p>
      <button onClick={reset} className="btn btn-primary">
        Try again
      </button>
    </div>
  );
}
```

---

## Feature Library — Six-File Pattern

Every feature (`home`, `blog`, `countries`, and any new one) uses these six files.
The only thing that changes between features is the external API URL and the types.

| File             | Marker        | Imports                      | Exports                                       |
| ---------------- | ------------- | ---------------------------- | --------------------------------------------- |
| `types.ts`       | (none)        | nothing                      | TypeScript interfaces                         |
| `schemas.ts`     | (none)        | `zod`                        | Zod schemas                                   |
| `service.ts`     | `server-only` | `env`, external `fetch`      | async functions (no auth, no headers)         |
| `server-api.ts`  | `server-only` | `next/headers`, `service`    | async functions calling `/api/[feature]`      |
| `client-api.ts`  | (none)        | types                        | async fetch wrappers calling `/api/[feature]` |
| `hooks/use-*.ts` | `use client`  | `@tanstack/react-query`, api | `useQuery` / `useMutation` wrappers           |

---

## Auth Hook Pattern

```typescript
// app/_lib/auth/hooks/use-auth-mutations.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/_lib/contexts/auth-context";
import { loginRequest, logoutRequest, registerRequest } from "../client-api";

export function useLoginMutation() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: async (data) => {
      await login(data); // stores token in React state
      router.push("/dashboard");
    },
  });
}

export function useLogoutMutation() {
  const { logout } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: async () => {
      await logout(); // clears token from state
      router.push("/login");
    },
  });
}
```

---

## DashboardGuard Pattern (keep, it is correct)

```typescript
// app/(dashboard)/_components/DashboardGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/_lib/contexts/auth-context";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null; // loading.tsx handles the spinner
  if (!user) return null;

  return <>{children}</>;
}
```

---

## next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "flagcdn.com" },
      { hostname: "upload.wikimedia.org" },
      { hostname: "mainfacts.com" },
      { hostname: "restcountries.com" },
    ],
  },
};

export default nextConfig;
```

---

## AI Agent Build Order

When prompting an AI to build this template, give it tasks in this order.
Each step produces files that the next step depends on.

```
Step 1 — Scaffold
  - init Next.js app with TypeScript + Tailwind + App Router
  - install all packages from the Stack table above
  - generate Prisma schema (User model)
  - run `npx prisma generate`

Step 2 — Env layer
  - create app/_lib/env.ts (t3-env schema)
  - create app/_lib/db.ts (Prisma singleton)

Step 3 — Auth library
  - app/_lib/auth/types.ts
  - app/_lib/auth/schemas.ts
  - app/_lib/auth/password.ts        (server-only, bcryptjs)
  - app/_lib/auth/token.ts           (server-only, jose)
  - app/_lib/auth/service.ts         (server-only, Prisma)
  - app/_lib/auth/client-api.ts

Step 4 — Auth context + providers
  - app/_lib/contexts/query-provider.tsx
  - app/_lib/contexts/auth-context.tsx
  - app/layout.tsx                   (wraps in QueryProvider + AuthProvider)

Step 5 — Middleware
  - middleware.ts                    (real JWT refresh cookie check)

Step 6 — Auth routes
  - app/api/auth/register/route.ts
  - app/api/auth/login/route.ts
  - app/api/auth/refresh/route.ts
  - app/api/auth/logout/route.ts
  - app/api/auth/me/route.ts

Step 7 — Auth UI
  - app/(auth)/layout.tsx
  - app/(auth)/login/page.tsx + LoginForm.tsx
  - app/(auth)/register/page.tsx + RegisterForm.tsx

Step 8 — Auth hooks
  - app/_lib/auth/hooks/use-require-auth.ts
  - app/_lib/auth/hooks/use-auth-mutations.ts

Step 9 — Dashboard route group
  - app/(dashboard)/layout.tsx
  - app/(dashboard)/_components/DashboardGuard.tsx
  - app/(dashboard)/_components/DashboardSidebar.tsx
  - app/(dashboard)/_components/DashboardNav.tsx
  - app/(dashboard)/dashboard/page.tsx + loading.tsx + error.tsx
  - app/(dashboard)/dashboard/profile/page.tsx
  - app/(dashboard)/dashboard/settings/page.tsx

Step 10 — Feature: Home
  - app/_lib/home/types.ts, schemas.ts, service.ts, server-api.ts, client-api.ts
  - app/_lib/home/hooks/use-home-data.ts
  - app/_lib/home/hooks/use-home-mutations.ts
  - app/api/home/route.ts
  - app/(default)/home/page.tsx + loading.tsx + error.tsx
  - app/(default)/home/_components/HomePageContent.tsx
  - app/(default)/home/_components/HomePageList.tsx

Step 11 — Feature: Blog
  - app/_lib/blog/types.ts, schemas.ts, service.ts, server-api.ts, client-api.ts
  - app/_lib/blog/hooks/use-blog-posts.ts, use-blog-post.ts, use-blog-mutations.ts
  - app/api/blog/route.ts
  - app/api/blog/[slug]/route.ts
  - app/(default)/blog/page.tsx + loading.tsx + error.tsx
  - app/(default)/blog/_components/BlogList.tsx
  - app/(default)/blog/[slug]/page.tsx + loading.tsx + error.tsx
  - app/(default)/blog/[slug]/_components/PostDetail.tsx

Step 12 — Feature: Countries
  - app/_lib/countries/types.ts, schemas.ts, service.ts, server-api.ts, client-api.ts
  - app/_lib/countries/hooks/use-countries.ts, use-country.ts
  - app/api/countries/route.ts
  - app/api/countries/[countryCode]/route.ts
  - app/(default)/countries/page.tsx + loading.tsx + error.tsx
  - app/(default)/countries/_components/CountriesList.tsx
  - app/(default)/countries/[countryCode]/page.tsx + loading.tsx + error.tsx
  - app/(default)/countries/[countryCode]/_components/CountryDetail.tsx

Step 13 — Default layout and shared components
  - app/(default)/layout.tsx
  - app/(default)/page.tsx
  - app/(default)/_components/Header.tsx
  - app/(default)/_components/Footer.tsx
  - app/(default)/unauthorized/page.tsx

Step 14 — Verify
  - npx tsc --noEmit
  - npx next build
  - fix any type errors
```

---

## Adding a New Feature

Follow this checklist for any new domain (e.g., `products`, `orders`, `events`):

1. Create `app/_lib/[feature]/` with the six files (types, schemas, service, server-api, client-api, hooks)
2. Add `app/api/[feature]/route.ts` (and `[id]/route.ts` if needed)
3. Add `app/(default)/[feature]/page.tsx` + `loading.tsx` + `error.tsx`
4. Add `app/(default)/[feature]/_components/[Feature]Content.tsx` (async server component)
5. If the feature needs client interactivity, add a `"use client"` component and a TanStack Query mutation hook
6. If the feature needs auth, call `requireAuth(request)` at the top of the route handler

---

## Patterns Cheat Sheet

| Need                                | Solution                                                                |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Initial page data, fast             | `async` server component -> `server-api.ts` -> internal `/api/`         |
| Client data after interaction       | `useQuery` from TanStack Query -> `client-api.ts`                       |
| Mutation with optimistic update     | `useMutation` with `onMutate` -> `setQueryData` -> `onError` rollback   |
| Route-level auth guard              | `requireAuth(request)` in route handler returns 401 on failure          |
| Page-level auth guard               | `useRequireAuth()` in `DashboardGuard` or page wrapper                  |
| Token security                      | Access token in React state; refresh token HTTP-only cookie             |
| Env var access                      | `env.DATABASE_URL` from `app/_lib/env.ts`, never `process.env` directly |
| Shared DB access                    | `db` singleton from `app/_lib/db.ts`                                    |
| Server-only logic in browser bundle | `import "server-only"` at top of every service and server-api file      |
| Loading UI                          | `loading.tsx` next to `page.tsx`                                        |
| Error UI                            | `error.tsx` next to `page.tsx` (must be `"use client"`)                 |
| Schema validation at API boundary   | `schema.safeParse(body)` in route handler, return 422 on failure        |
