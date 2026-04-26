"use client";

import { useQuery } from "@tanstack/react-query";

import { getCountry } from "../client-api";

export function useCountry(code: string) {
  return useQuery({
    queryKey: ["country", code],
    queryFn: () => getCountry(code),
    enabled: code.length === 3,
  });
}
