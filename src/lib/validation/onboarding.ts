import { z } from "zod";

// Uzupełnienie profilu po pierwszym logowaniu przez OAuth (Etap 15) - dostawcy (Google,
// Facebook) w podstawowym zakresie uprawnień nie udostępniają daty urodzenia ani płci,
// a Profile.birthDate jest wymagane do weryfikacji wieku 18+ (patrz src/lib/validation/auth.ts).
export const onboardingSchema = z.object({
  displayName: z.string().trim().min(1).max(50),
  birthDate: z.coerce.date(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
