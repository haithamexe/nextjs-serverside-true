import { z } from "zod";

export const proxyGuardHeadersSchema = z.object({
  "x-home-authenticated": z.literal("true"),
  "x-home-session-id": z.string().min(1),
  "x-home-request-id": z.string().uuid(),
});

export const homeMutationPayloadSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(1),
  completed: z.boolean().optional(),
  userId: z.number().int().positive().optional(),
});

export const homeDeletePayloadSchema = z.object({
  countryCode: z.string().trim().length(3),
});

export type HomeDeletePayload = z.infer<typeof homeDeletePayloadSchema>;
