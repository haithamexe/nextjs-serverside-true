"use client";

import { useQuery } from "@tanstack/react-query";

import { getBlogPost } from "../client-api";

export function useBlogPost(id: number) {
  return useQuery({
    queryKey: ["blog-post", id],
    queryFn: () => getBlogPost(id),
    enabled: id > 0,
  });
}
