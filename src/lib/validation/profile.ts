import { z } from "zod";

export const profileUpdateSchema = z
  .object({
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    bio: z.string().trim().max(500).optional().default(""),
    city: z.string().trim().max(100).optional().default(""),
    interestIds: z.array(z.string().min(1)).max(10),
    minAge: z.coerce.number().int().min(18).max(99),
    maxAge: z.coerce.number().int().min(18).max(99),
    maxDistanceKm: z.coerce.number().int().min(1).max(500),
    interestedIn: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
  })
  .refine((data) => data.minAge <= data.maxAge, {
    message: "Minimalny wiek nie może być większy niż maksymalny.",
    path: ["minAge"],
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
