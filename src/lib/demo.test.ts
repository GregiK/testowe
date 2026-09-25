import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isDemoModeEnabled, findDemoProfile, DEMO_PROFILES } from "./demo";

describe("isDemoModeEnabled", () => {
  const original = process.env.DEMO_MODE_ENABLED;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.DEMO_MODE_ENABLED;
    } else {
      process.env.DEMO_MODE_ENABLED = original;
    }
  });

  it("domyślnie (brak zmiennej) jest wyłączony", () => {
    delete process.env.DEMO_MODE_ENABLED;
    expect(isDemoModeEnabled()).toBe(false);
  });

  it("jest wyłączony dla dowolnej innej wartości niż dokładnie 'true'", () => {
    process.env.DEMO_MODE_ENABLED = "1";
    expect(isDemoModeEnabled()).toBe(false);
    process.env.DEMO_MODE_ENABLED = "TRUE";
    expect(isDemoModeEnabled()).toBe(false);
  });

  it("jest włączony wyłącznie gdy zmienna to dokładnie 'true'", () => {
    process.env.DEMO_MODE_ENABLED = "true";
    expect(isDemoModeEnabled()).toBe(true);
  });
});

describe("findDemoProfile", () => {
  it("zwraca profil dla znanego sluga", () => {
    const p = findDemoProfile("anna");
    expect(p).not.toBeNull();
    expect(p?.userId).toBe("demo-user-anna");
  });

  it("zwraca null dla nieznanego/dowolnego wejścia (w tym prób injekcji)", () => {
    expect(findDemoProfile("nieznany")).toBeNull();
    expect(findDemoProfile("../../etc/passwd")).toBeNull();
    expect(findDemoProfile("")).toBeNull();
  });

  it("ma dokładnie 5 gotowych profili demo z unikalnymi ID", () => {
    expect(DEMO_PROFILES).toHaveLength(5);
    const ids = new Set(DEMO_PROFILES.map((p) => p.userId));
    expect(ids.size).toBe(5);
  });
});
