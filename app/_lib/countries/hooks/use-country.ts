"use client";

import { useEffect, useState } from "react";

import { getCountry } from "../client-api";
import type { CountryDetail } from "../types";

export function useCountry(code: string): {
  country: CountryDetail | null;
  isLoading: boolean;
  error: string | null;
} {
  const [country, setCountry] = useState<CountryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getCountry(code)
      .then((data) => {
        if (!isMounted) return;
        setCountry(data);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load country");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  return { country, isLoading, error };
}
