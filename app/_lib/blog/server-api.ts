import "server-only";

import { headers } from "next/headers";

import type { BlogApiResponse, BlogPost } from "./types";

async function getBaseUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    throw new Error("Missing host header for internal API request");
  }

  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

async function requestInternalBlogApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const requestHeaders = await headers();
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      cookie: requestHeaders.get("cookie") ?? "",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as BlogApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.error ?? "Internal blog API request failed");
  }

  return payload.data as T;
}

export function getBlogPostsFromApi(): Promise<BlogPost[]> {
  return requestInternalBlogApi<BlogPost[]>("/api/blog", { method: "GET" });
}

export function getBlogPostFromApi(id: number): Promise<BlogPost> {
  return requestInternalBlogApi<BlogPost>(`/api/blog/${id}`, {
    method: "GET",
  });
}
