import type { BlogApiResponse, BlogMutationPayload, BlogPost } from "./types";

export type { BlogMutationPayload, BlogPost } from "./types";

async function requestBlogApi<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as BlogApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.error ?? "Blog API request failed");
  }

  return payload.data as T;
}

export function getBlogPosts(): Promise<BlogPost[]> {
  return requestBlogApi<BlogPost[]>("/api/blog", { method: "GET" });
}

export function getBlogPost(id: number): Promise<BlogPost> {
  return requestBlogApi<BlogPost>(`/api/blog/${id}`, { method: "GET" });
}

export function createBlogPost(data: BlogMutationPayload): Promise<BlogPost> {
  return requestBlogApi<BlogPost>("/api/blog", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateBlogPost(data: BlogMutationPayload): Promise<BlogPost> {
  return requestBlogApi<BlogPost>(`/api/blog/${data.id ?? ""}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteBlogPost(id: number): Promise<void> {
  return requestBlogApi<void>(`/api/blog/${id}`, { method: "DELETE" });
}
