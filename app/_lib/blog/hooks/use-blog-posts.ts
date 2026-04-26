"use client";

import { useQuery } from "@tanstack/react-query";

import { getBlogPosts } from "../client-api";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: getBlogPosts,
  });
}
