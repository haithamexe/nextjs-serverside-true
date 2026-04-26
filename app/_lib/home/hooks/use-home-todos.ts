"use client";

import { useQuery } from "@tanstack/react-query";

import { getHomeTodos } from "../client-api";

export function useHomeTodos() {
  return useQuery({
    queryKey: ["home-todos"],
    queryFn: getHomeTodos,
  });
}
