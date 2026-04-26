"use client";

import { useQuery } from "@tanstack/react-query";

import { getCountries } from "../client-api";

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
}
