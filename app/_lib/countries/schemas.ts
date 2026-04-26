import { z } from "zod";

export const countryCodeSchema = z.object({
  countryCode: z
    .string()
    .trim()
    .length(3, "Country code must be exactly 3 characters")
    .toUpperCase(),
});

export type CountryCodeInput = z.infer<typeof countryCodeSchema>;
