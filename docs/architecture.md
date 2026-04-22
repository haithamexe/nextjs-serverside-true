# Architecture: State Management, Data Fetching & Abstractions

## Overview

This app uses a **hybrid server-first + optimistic client** architecture built on Next.js App Router.
The core idea: fetch data on the server for the initial render, but route that fetch through the Next.js
API boundary so auth/session guards, header inspection, and runtime validation can be centralized in the
`app/api` layer. Client hooks stay thin and own only local interactivity.

The next improvement area is **component streamlining**: the current layering is good, but some UI files
still do too much at once. The right direction is to keep container components small, move domain-specific
state logic into hooks, and move repeated data-shaping into shared helpers so the render tree reads like UI
instead of business logic.

---

## The Full Layer Stack

```
Browser UI (React)
    │
    │  renders initial data from props (no fetch in browser for reads)
    ▼
Server Component  ──────────────────────────────────────────────
  │  app/(default)/home/HomePage.tsx
  │
  │  await getHomeTodosFromApi()
  ▼
Internal API Client  ───────────────────────────────────────────
  │  app/lib/home/server-api.ts
  │
  │  fetch("/api/home") with forwarded cookies/headers
  ▼
Proxy  ─────────────────────────────────────────────────────────
  │  proxy.ts
  │
  │  stamps request-id, pseudo-session, and authenticated headers
  ▼
Route Handler  ─────────────────────────────────────────────────
  │  app/api/home/route.ts
  │
  │  validates proxy headers + request payloads with Zod
  │  calls service
  ▼
Server-only Service  ────────────────────────────────────────────
  │  app/lib/home/service.ts  ("server-only" guard)
  │
  │  requestHomeBackend()   ← raw fetch to external API (restcountries.com)
  ▼
External API  ───────────────────────────────────────────────────
  restcountries.com/v3.1/all

─────────────────────────────────────────────────────────────────
    Client mutation path (delete, create, update):

Browser UI
    │
    │  useHomeDelete()
    ▼
Client Hook  ────────────────────────────────────────────────────
    │  app/lib/home/hooks/use-home-delete.ts
    │
    │  deleteHomePost()   ← calls client api-layer
    ▼
Client API Layer  ───────────────────────────────────────────────
    │  app/lib/home/api-layer.ts
    │
    │  fetch("/api/home", { method: "DELETE" })
    ▼
Route Handler  ──────────────────────────────────────────────────
    │  app/api/home/route.ts
    │
    │  parses request.json()
    │  calls deleteHomePost() from service
    ▼
Server-only Service  ────────────────────────────────────────────
    app/lib/home/service.ts   ← same service, now used server-side via HTTP
```

---

## Why It Is Fast

### 1. Server-side initial fetch (zero client waterfalls)

`HomePage` is an `async` React Server Component. It `await`s `getHomeTodosFromApi()` before
sending any HTML to the browser. The user receives fully populated HTML on the first
response — no loading spinner, no skeleton, no second round-trip.

```ts
// app/(default)/home/HomePage.tsx
const HomePage = async () => {
  const todos = await getHomeTodosFromApi();
  return <HomePageList todos={todos} />;
};
```

### 2. The read path now favors protection over the absolute fastest hop

The server component now fetches through `/api/home` on purpose. That adds one internal
hop, but it guarantees the GET request passes through the same guardrail stack as writes:

- Proxy headers are attached in `proxy.ts`
- auth/session placeholders are centralized there
- request validation and request-shape enforcement live in `app/api/home/route.ts`
- service logic stays pure and does not need to know about auth, headers, or sessions

This is slightly slower than a direct service call, but it is more consistent and safer
for a backend-first application that wants one enforced API boundary.

### 3. Optimistic client delete (instant perceived response)

When a user clicks Delete, the item disappears from the list immediately in local state
before the server confirms the operation. This makes the UI feel instant regardless of
network latency.

```ts
const handleDelete = async (id: string) => {
  setTodosList((prev) => prev.filter((todo) => todo.cca3 !== id)); // instant
  await deletePost(id); // fires in the background
};
```

### 4. Proxy provides a framework-level request gate

`proxy.ts` runs before `/api/home` and stamps upstream headers like:

- `x-home-authenticated`
- `x-home-session-id`
- `x-home-request-id`

The route handler rejects requests that do not satisfy those headers. Right now this is a
placeholder auth/session model because the app does not have real auth yet, but the shape
is correct: real session inspection can replace the placeholder later without changing the
service layer.

### 5. `server-only` guard prevents leaking server logic to the client bundle

`service.ts` has `import "server-only"` at the top. If you accidentally try to import
it in a client component, Next.js will throw a build error. This means your external API
credentials, internal URLs, and backend logic never get shipped to the browser.

---

## File Responsibilities (Single Responsibility Principle)

| File                                    | Environment | Responsibility                                                         |
| --------------------------------------- | ----------- | ---------------------------------------------------------------------- |
| `app/lib/home/types.ts`                 | Both        | Shared TypeScript interfaces only. No logic.                           |
| `proxy.ts`                              | Edge/Proxy  | Adds pseudo-session/auth headers and request IDs before API routes.    |
| `app/lib/home/service.ts`               | Server only | Raw fetch to external APIs. Error handling for backend calls.          |
| `app/api/home/route.ts`                 | Server only | Enforces guards, validates with Zod, then calls service.               |
| `app/lib/home/api-layer.ts`             | Client only | Calls your own `/api/home` endpoint. Wraps fetch with typed helpers.   |
| `app/lib/home/server-api.ts`            | Server only | Calls internal `/api/home` from server components.                     |
| `app/lib/home/hooks/use-home-delete.ts` | Client only | React hook. Delegates to api-layer. Keeps hook API clean.              |
| `app/lib/home/schemas.ts`               | Server only | Zod schemas for headers and request payloads.                          |
| `app/(default)/home/HomePage.tsx`       | Server only | Async server component. Fetches through internal API and passes props. |
| `app/(default)/home/HomePageList.tsx`   | Client      | UI + local optimistic state. Receives typed props. Uses hooks.         |

---

## Current Readability Assessment

The architecture is in the right direction, but the current `HomePageList` still mixes four concerns:

1. Local optimistic state management.
2. Mutation orchestration (`deletePost`, rollback).
3. Data shaping for display (`currencies`, `languages`, `nativeNames`, translation samples).
4. The full visual card markup.

That file is still understandable, but it is the first place that will become noisy as more actions or UI
states are added.

### What is already good

- `HomePage` is small and server-only.
- The guarded API boundary is centralized.
- The service layer is protected by `server-only`.
- Delete logic is already partially abstracted into `useHomeDelete`.

### What should be improved next

- Move optimistic list state into a dedicated list hook.
- Move country-to-dashboard display shaping into a helper or view-model function.
- Split the large country card into smaller presentational components.
- Centralize generic request wrappers in shared utilities instead of feature-local copies.

---

## How To Streamline Components

### 1. Keep server containers minimal

The server component should only do three things:

1. Fetch data.
2. Pass typed props.
3. Compose the page.

That means `HomePage` should stay very small:

```ts
const HomePage = async () => {
  const todos = await getHomeTodosFromApi();
  return <HomeCountriesSection todos={todos} />;
};
```

### 2. Move client state orchestration into a list hook

Right now `HomePageList` owns optimistic deletion directly. That works, but it mixes UI and behavior.
Better structure:

```ts
// app/lib/home/hooks/use-home-country-list.ts
export function useHomeCountryList(initialTodos: HomeTodo[]) {
  const [todos, setTodos] = useState(initialTodos);
  const { deletePost } = useHomeDelete();

  async function removeCountry(countryCode: string) {
    const previous = todos;
    setTodos((prev) => prev.filter((todo) => todo.cca3 !== countryCode));

    try {
      await deletePost(countryCode);
    } catch {
      setTodos(previous);
    }
  }

  return { todos, removeCountry };
}
```

Then the component becomes simpler:

```ts
const { todos, removeCountry } = useHomeCountryList(initialTodos);
```

### 3. Move display shaping into a helper

This block is UI-adjacent but not really rendering logic:

- `capitals`
- `currencies`
- `languages`
- `nativeNames`
- `translationSamples`

Move it into something like:

```ts
// app/lib/home/presenters.ts
export function buildCountryDashboard(country: HomeTodo) {
  return {
    capitals: country.capital?.join(", ") || "N/A",
    currencies: country.currencies
      ? Object.entries(country.currencies).map(([code, value]) => ({
          code,
          name: value.name,
          symbol: value.symbol,
        }))
      : [],
    languages: country.languages ? Object.values(country.languages) : [],
    nativeNames: country.name.nativeName
      ? Object.values(country.name.nativeName).map((entry) => entry.common)
      : [],
  };
}
```

Then the UI reads closer to plain markup.

### 4. Split large UI blocks into presentational pieces

Instead of one large `HomePageList.tsx`, prefer small components like:

- `HomeCountryList`
- `HomeCountryCard`
- `HomeCountryMedia`
- `HomeCountryStats`
- `HomeCountryLinks`

Suggested structure:

```text
app/(default)/home/
  HomePage.tsx                 // server container
  HomeCountriesClient.tsx      // client boundary for list state
  components/
    HomeCountryList.tsx
    HomeCountryCard.tsx
    HomeCountryMedia.tsx
    HomeCountryStats.tsx
    HomeCountryLinks.tsx
```

That gives you cleaner reading:

```tsx
<HomeCountryCard country={country} onDelete={removeCountry} />
```

instead of a single file that computes, transforms, and renders everything inline.

### 5. Keep hooks behavioral, not transport-aware

Hooks should not know about URLs, request methods, or headers.

Good:

```ts
const { deletePost } = useHomeDelete();
```

Bad:

```ts
await fetch("/api/home", { method: "DELETE" });
```

That transport logic belongs in the api-layer or a shared request wrapper.

---

## Better Centralization Strategy

The next centralization step is not more layers. It is **better shared primitives**.

### 1. Shared client request utility

Instead of each feature owning a private `requestHomeApi`, move the primitive to a shared utility:

```ts
// app/lib/http/client.ts
export async function clientRequest<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload.data as T;
}
```

Then `app/lib/home/api-layer.ts` becomes tiny.

### 2. Shared server request utility

Do the same for external backend calls:

```ts
// app/lib/http/server.ts
import "server-only";

export async function serverRequest<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
```

Then each feature service becomes mostly endpoint-specific functions.

### 3. Shared route helpers

Your routes will become more consistent if they reuse a small route toolkit:

- `assertProxyGuard(request)`
- `parseJson(request, schema)`
- `toErrorResponse(error)`

Suggested location:

```text
app/lib/http/route.ts
```

This keeps each route focused on behavior instead of repeated plumbing.

### 4. Shared schemas by concern

Keep feature schemas in the feature folder, but move generic patterns into shared schema helpers if they recur:

- guarded header schemas
- pagination schemas
- id/code schemas
- success/error response schemas

### 5. Shared presenters / view models

When the same raw API object is rendered in multiple places, create a presenter layer.

Suggested location:

```text
app/lib/home/presenters.ts
```

This gives one place for:

- formatting population
- deciding fallback text
- selecting image sources
- shaping currencies/languages into UI-friendly arrays

---

## How to Add More Features Using the Same Pattern

### Adding a new guarded read (e.g. get country by code)

**Step 1 — service.ts** (server, calls external API)

```ts
export function getCountryByCode(code: string) {
  return requestHomeBackend<HomeTodo>(
    `https://restcountries.com/v3.1/alpha/${code}?fields=cca3,name,flag,flags`,
  );
}
```

**Step 2 — route.ts** (required if you want all reads to pass auth/validation)

```ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const data = await getCountryByCode(code ?? "");
  return NextResponse.json({ data });
}
```

**Step 3 — Server component** (consumes internal API, not service directly)

```ts
const CountryPage = async ({ params }: { params: { code: string } }) => {
  const country = await requestInternalHomeApi(`/api/home?code=${params.code}`);
  return <CountryDetail country={country} />;
};
```

---

### Adding a new mutation (e.g. add to favourites)

**Step 1 — api-layer.ts** (client, calls your route)

```ts
export function addFavourite(cca3: string) {
  return requestHomeApi<undefined>("/api/favourites", {
    method: "POST",
    body: JSON.stringify({ cca3 }),
  });
}
```

**Step 2 — Hook** (client, wraps the api-layer call)

```ts
// app/lib/home/hooks/use-home-favourite.ts
"use client";
import { addFavourite } from "../api-layer";

export function useHomeFavourite() {
  async function toggleFavourite(cca3: string) {
    await addFavourite(cca3);
  }
  return { toggleFavourite };
}
```

**Step 3 — Component** (consumes the hook, no fetch logic in the UI)

```ts
const { toggleFavourite } = useHomeFavourite();
<button onClick={() => void toggleFavourite(country.cca3)}>★</button>
```

---

### Creating a central generic fetch wrapper

If you want to reuse `requestHomeApi` across features, promote it to a shared utility:

```ts
// app/lib/utils/api.ts
export async function apiRequest<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Request failed");
  return payload.data as T;
}
```

Then each feature api-layer imports from that one place:

```ts
// app/lib/home/api-layer.ts
import { apiRequest } from "@/app/lib/utils/api";

export function getHomeTodos() {
  return apiRequest<HomeTodo[]>("/api/home", { method: "GET" });
}
```

This is the preferred direction for centralization: keep feature functions, but have them all rely on one
shared transport primitive.

Same for the server-side `requestHomeBackend`:

```ts
// app/lib/utils/server-api.ts
import "server-only";

export async function serverRequest<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
```

---

## Validation And Guarding Strategy

### Why validation belongs in the route

The route handler is the first stable server boundary for client traffic. It is the right
place to:

- validate request bodies with Zod
- validate required proxy/auth headers
- normalize error responses
- reject malformed requests before they reach the service layer

The service should assume it is receiving already-validated input.

### Current Zod coverage

- `homeMutationPayloadSchema` validates `POST` and `PUT`
- `homeDeletePayloadSchema` validates `DELETE`
- `proxyGuardHeadersSchema` validates proxy-injected request metadata

### Current auth/session model

There is no real auth provider yet. The app currently uses `proxy.ts` to attach:

- a generated session cookie (`home-session`) when missing
- `x-home-authenticated: true`
- `x-home-session-id`
- `x-home-request-id`

This is intentionally a placeholder. Later, real session checks can replace this in
`proxy.ts` without forcing a redesign of `route.ts` or `service.ts`.

### Important tradeoff

Routing GET through `/api/home` is not the lowest-latency option. The faster option is a
direct server-component-to-service call. The current design intentionally gives that up to
gain one consistent enforcement point for auth, headers, request validation, and future
rate limiting.

---

## Recommended Feature Structure

If the home feature keeps growing, this is a cleaner target structure:

```text
app/
  (default)/home/
    HomePage.tsx
    HomeCountriesClient.tsx
    components/
      HomeCountryList.tsx
      HomeCountryCard.tsx
      HomeCountryMedia.tsx
      HomeCountryStats.tsx
      HomeCountryLinks.tsx

app/lib/home/
  api-layer.ts
  schemas.ts
  service.ts
  server-api.ts
  presenters.ts
  types.ts
  hooks/
    use-home-delete.ts
    use-home-country-list.ts
```

### Why this structure reads better

- Page-level files stay short and compositional.
- Feature logic stays near the feature.
- Hooks own stateful behavior.
- Presenters own transformation logic.
- Components become mostly JSX and props.
- Services and routes stay transport- and backend-focused.

---

## Patterns Summary

| Goal                        | Pattern                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Initial page data guarded   | `async` server component + internal API call through proxy + route validation                       |
| Instant UI on mutation      | Optimistic local state update before awaiting the network                                           |
| No backend logic in browser | `server-only` + service layer                                                                       |
| Central auth/session checks | `proxy.ts` stamps headers/cookies, route validates and enforces                                     |
| Clean components            | Hooks own behavior, presenters shape data, components mostly render                                 |
| Better readability          | Split big feature components into server container, client boundary, and small presentational parts |
| Better centralization       | Shared request wrappers, route helpers, and presenter helpers                                       |
| Easy to test                | Each layer is a plain function — hooks, service, api-layer are all unit-testable independently      |
| Avoid prop drilling         | Move shared state to a context provider wrapping the feature subtree                                |

---

## When to Use What

```
Need data on first render with strict API enforcement?
  → fetch in async server component via internal `/api/...`

Need the absolute fastest server-side read and you trust the caller?
  → call the service directly

Need to react to user interaction?
  → handle in a client hook

Is a component doing data shaping and rendering at the same time?
  → move shaping into a presenter/helper

Is a component handling list state and rendering cards at the same time?
  → add a client boundary component or a focused list hook

Do multiple features repeat fetch / route / error plumbing?
  → centralize shared request and route helpers

Need optimistic feedback?
  → update local state first, then call hook, rollback on error

Need to share mutation state across multiple components?
  → lift state to a context provider, keep hook inside it
```
