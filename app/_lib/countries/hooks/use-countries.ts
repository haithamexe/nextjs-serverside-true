"use client";

import { useEffect, useState } from "react";

import { getCountries } from "../client-api";
import type { Country } from "../types";

export function useCountries(): {
  countries: Country[];
  isLoading: boolean;
  error: string | null;
} {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getCountries()
      .then((data) => {
        if (!isMounted) return;
        setCountries(data);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load countries",
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { countries, isLoading, error };
}
