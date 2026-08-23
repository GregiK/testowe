import { describe, it, expect, vi, afterEach } from "vitest";
import { calculateAge } from "./age";

describe("calculateAge", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("liczy pełne lata gdy urodziny już minęły w tym roku", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-23T12:00:00Z"));
    expect(calculateAge(new Date("2000-01-01T00:00:00Z"))).toBe(26);
  });

  it("nie dolicza roku, gdy urodziny jeszcze nie minęły w tym roku", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    expect(calculateAge(new Date("2000-12-31T00:00:00Z"))).toBe(25);
  });

  it("liczy poprawnie dokładnie w dniu urodzin", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-23T12:00:00Z"));
    expect(calculateAge(new Date("2000-08-23T00:00:00Z"))).toBe(26);
  });
});
