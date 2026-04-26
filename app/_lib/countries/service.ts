import "server-only";

import type { Country, CountryDetail } from "./types";

const BASE = "https://restcountries.com/v3.1";
const LIST_FIELDS = "fields=cca3,name,flags,region,population";
const DETAIL_FIELDS =
  "fields=cca3,name,flags,region,population,subregion,capital,currencies,languages,coatOfArms,maps,latlng,timezones,area";

async function requestCountriesBackend<T>(
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
      `Countries backend request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export function getCountries(): Promise<Country[]> {
  return requestCountriesBackend<Country[]>(`${BASE}/all?${LIST_FIELDS}`);
}

export async function getCountry(code: string): Promise<CountryDetail> {
  // /alpha/{code} returns an array of one item
  const results = await requestCountriesBackend<CountryDetail[]>(
    `${BASE}/alpha/${code}?${DETAIL_FIELDS}`,
  );
  const country = results[0];
  if (!country) {
    throw new Error(`Country not found: ${code}`);
  }
  return country;
}
