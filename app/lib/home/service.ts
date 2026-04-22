import "server-only";

import type { HomeMutationPayload, HomeTodo } from "./types";

interface HomeBackendResponse {
  id?: number;
  title?: string;
  completed?: boolean;
  userId?: number;
}

async function requestHomeBackend<T>(
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
      `Home backend request failed: ${response.status} ${response.statusText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getHomeTodos() {
  return requestHomeBackend<HomeTodo[]>(
    "https://restcountries.com/v3.1/all?fields=cca3,flag,flags,coatOfArms,name,capital,currencies,languages,region,population",
    {
      method: "GET",
    },
  );
}

export function createHomePost(data: HomeMutationPayload) {
  return requestHomeBackend<HomeBackendResponse>(
    `https://jsonplaceholder.typicode.com/posts/${data.id ?? ""}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function updateHomePost(data: HomeMutationPayload) {
  return requestHomeBackend<HomeBackendResponse>(
    `https://jsonplaceholder.typicode.com/posts/${data.id ?? ""}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteHomePost(countryCode: string) {
  return { countryCode };
}
