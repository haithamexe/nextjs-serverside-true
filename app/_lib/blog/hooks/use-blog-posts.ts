"use client";

import { useEffect, useState } from "react";

import { getBlogPosts } from "../client-api";
import type { BlogPost } from "../types";

export function useBlogPosts(): {
  posts: BlogPost[];
  isLoading: boolean;
  error: string | null;
} {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getBlogPosts()
      .then((data) => {
        if (!isMounted) return;
        setPosts(data);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load posts");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { posts, isLoading, error };
}
