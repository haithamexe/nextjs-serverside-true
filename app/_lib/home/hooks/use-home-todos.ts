"use client";

import { useEffect, useState } from "react";
import { getHomeTodos } from "../client-api";
import type { HomeTodo } from "../types";

export function useHomeTodos(): HomeTodo[] {
  const [todos, setTodos] = useState<HomeTodo[]>([]);

  useEffect(() => {
    let isMounted = true;

    getHomeTodos()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setTodos(data);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setTodos([]);
      });

    return () => {
      isMounted = false;
    };
  }, [setTodos]);

  return todos;
}
