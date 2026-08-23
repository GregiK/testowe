import { describe, it, expect } from "vitest";
import { profileUpdateSchema } from "./profile";

const base = {
  gender: "FEMALE" as const,
  bio: "Cześć!",
  city: "Warszawa",
  interestIds: ["int_muzyka", "int_sport"],
  minAge: 20,
  maxAge: 30,
  maxDistanceKm: 50,
  interestedIn: "MALE" as const,
};

describe("profileUpdateSchema", () => {
  it("akceptuje poprawne dane", () => {
    expect(profileUpdateSchema.safeParse(base).success).toBe(true);
  });

  it("odrzuca minAge większy niż maxAge", () => {
    const result = profileUpdateSchema.safeParse({ ...base, minAge: 40, maxAge: 30 });
    expect(result.success).toBe(false);
  });

  it("odrzuca więcej niż 10 zainteresowań", () => {
    const result = profileUpdateSchema.safeParse({
      ...base,
      interestIds: Array.from({ length: 11 }, (_, i) => `int_${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("odrzuca wiek poniżej 18", () => {
    const result = profileUpdateSchema.safeParse({ ...base, minAge: 15 });
    expect(result.success).toBe(false);
  });

  it("akceptuje interestedIn = null (wszystkie płcie)", () => {
    const result = profileUpdateSchema.safeParse({ ...base, interestedIn: null });
    expect(result.success).toBe(true);
  });

  it("domyślnie ustawia pustą bio/city, gdy pominięte", () => {
    const { bio, city, ...rest } = base;
    const result = profileUpdateSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bio).toBe("");
      expect(result.data.city).toBe("");
    }
  });
});
