import { z } from "zod";

// Hasło: min. 10 znaków - świadomie wyżej niż klasyczne 8, bez wymogu Redis/Have-I-Been-Pwned
// na etapie MVP (można dodać w kolejnym etapie).
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(10).max(128),
  birthDate: z.coerce.date(),
  displayName: z.string().trim().min(1).max(50),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const MIN_AGE_YEARS = 18;

export function isAdult(birthDate: Date): boolean {
  const today = new Date();
  const age =
    today.getFullYear() -
    birthDate.getFullYear() -
    (today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
      ? 1
      : 0);
  return age >= MIN_AGE_YEARS;
}
