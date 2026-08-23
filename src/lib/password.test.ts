import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("poprawne hasło weryfikuje się pozytywnie", async () => {
    const hash = await hashPassword("MojeSuperHaslo123");
    expect(await verifyPassword(hash, "MojeSuperHaslo123")).toBe(true);
  });

  it("błędne hasło weryfikuje się negatywnie", async () => {
    const hash = await hashPassword("MojeSuperHaslo123");
    expect(await verifyPassword(hash, "ZleHaslo")).toBe(false);
  });

  it("dwa hashe tego samego hasła różnią się (losowa sól)", async () => {
    const hashA = await hashPassword("TakieSamoHaslo");
    const hashB = await hashPassword("TakieSamoHaslo");
    expect(hashA).not.toBe(hashB);
  });

  it("zwraca false zamiast rzucać wyjątek dla uszkodzonego/pustego hasha", async () => {
    expect(await verifyPassword("cos-nieprawidlowego", "dowolne")).toBe(false);
    expect(await verifyPassword("", "dowolne")).toBe(false);
  });

  it("hash ma format scrypt$N$r$p$sol$klucz", async () => {
    const hash = await hashPassword("Test123456");
    const parts = hash.split("$");
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe("scrypt");
  });
});
