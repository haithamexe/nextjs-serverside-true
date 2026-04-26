import type { CountriesApiResponse, Country, CountryDetail } from "./types";

export type { Country, CountryDetail } from "./types";

async function requestCountriesApi<T>(
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

  const payload = (await response.json()) as CountriesApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.error ?? "Countries API request failed");
  }

  return payload.data as T;
}

export function getCountries(): Promise<Country[]> {
  return requestCountriesApi<Country[]>("/api/countries", { method: "GET" });
}

export function getCountry(code: string): Promise<CountryDetail> {
  return requestCountriesApi<CountryDetail>(`/api/countries/${code}`, {
    method: "GET",
  });
}
