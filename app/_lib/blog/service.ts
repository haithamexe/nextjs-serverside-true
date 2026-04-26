import "server-only";

import type { BlogMutationPayload, BlogPost } from "./types";

const BASE = "https://jsonplaceholder.typicode.com";

async function requestBlogBackend<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Blog backend request failed: ${response.status} ${response.statusText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getBlogPosts(): Promise<BlogPost[]> {
  return requestBlogBackend<BlogPost[]>(`${BASE}/posts?_limit=20`);
}

export function getBlogPost(id: number): Promise<BlogPost> {
  return requestBlogBackend<BlogPost>(`${BASE}/posts/${id}`);
}

export function createBlogPost(data: BlogMutationPayload): Promise<BlogPost> {
  return requestBlogBackend<BlogPost>(`${BASE}/posts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateBlogPost(data: BlogMutationPayload): Promise<BlogPost> {
  return requestBlogBackend<BlogPost>(`${BASE}/posts/${data.id ?? ""}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBlogPost(id: number): Promise<void> {
  await requestBlogBackend<unknown>(`${BASE}/posts/${id}`, {
    method: "DELETE",
  });
}
