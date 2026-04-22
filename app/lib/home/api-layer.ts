import type { HomeApiResponse, HomeMutationPayload, HomeTodo } from "./types";

export type { HomeMutationPayload, HomeTodo } from "./types";

async function requestHomeApi<T>(
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

  const payload = (await response.json()) as HomeApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.error || "Home API request failed");
  }

  return payload.data as T;
}

export function getHomeTodos() {
  return requestHomeApi<HomeTodo[]>("/api/home", { method: "GET" });
}

export function createHomePost(data: HomeMutationPayload) {
  return requestHomeApi<undefined>("/api/home", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateHomePost(data: HomeMutationPayload) {
  return requestHomeApi<undefined>("/api/home", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteHomePost(id: number) {
  return requestHomeApi<undefined>("/api/home", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}
