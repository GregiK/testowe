import { describe, it, expect, vi, afterEach } from "vitest";
import { registerSchema, loginSchema, isAdult } from "./auth";

describe("registerSchema", () => {
  it("akceptuje poprawne dane rejestracji", () => {
    const result = registerSchema.safeParse({
      email: "Test@Example.com",
      password: "bezpieczneHaslo123",
      birthDate: "2000-01-01",
      displayName: "Ala",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // email normalizowany do lowercase - istotne dla unikalności w bazie
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("odrzuca zbyt krótkie hasło", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "krotkie",
      birthDate: "2000-01-01",
      displayName: "Ala",
    });
    expect(result.success).toBe(false);
  });

  it("odrzuca nieprawidłowy e-mail", () => {
    const result = registerSchema.safeParse({
      email: "nie-email",
      password: "bezpieczneHaslo123",
      birthDate: "2000-01-01",
      displayName: "Ala",
    });
    expect(result.success).toBe(false);
  });

  it("odrzuca pustą nazwę wyświetlaną", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "bezpieczneHaslo123",
      birthDate: "2000-01-01",
      displayName: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("akceptuje dowolne niepuste hasło (walidacja siły hasła nie dotyczy logowania)", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "x" });
    expect(result.success).toBe(true);
  });
});

describe("isAdult", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("zwraca true dla osoby dokładnie 18-letniej", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-23T12:00:00Z"));
    expect(isAdult(new Date("2008-08-23T00:00:00Z"))).toBe(true);
  });

  it("zwraca false dzień przed 18. urodzinami", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-23T12:00:00Z"));
    expect(isAdult(new Date("2008-08-24T00:00:00Z"))).toBe(false);
  });
});
