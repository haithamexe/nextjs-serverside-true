"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteHomePost } from "../client-api";
import type { HomeTodo } from "../types";

export function useHomeDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHomePost,
    onMutate: async (countryCode: string) => {
      await queryClient.cancelQueries({ queryKey: ["home-todos"] });
      const previous = queryClient.getQueryData<HomeTodo[]>(["home-todos"]);
      queryClient.setQueryData<HomeTodo[]>(
        ["home-todos"],
        (old) => old?.filter((t) => t.cca3 !== countryCode) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["home-todos"], ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["home-todos"] });
    },
  });
}
