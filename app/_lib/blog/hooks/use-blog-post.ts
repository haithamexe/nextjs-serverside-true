"use client";

import { useEffect, useState } from "react";

import { getBlogPost } from "../client-api";
import type { BlogPost } from "../types";

export function useBlogPost(id: number): {
  post: BlogPost | null;
  isLoading: boolean;
  error: string | null;
} {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getBlogPost(id)
      .then((data) => {
        if (!isMounted) return;
        setPost(data);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load post");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { post, isLoading, error };
}
