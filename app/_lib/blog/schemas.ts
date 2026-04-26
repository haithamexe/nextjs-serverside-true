import { z } from "zod";

export const blogMutationPayloadSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Body is required"),
  userId: z.number().int().positive().optional(),
});

export type BlogMutationInput = z.infer<typeof blogMutationPayloadSchema>;
