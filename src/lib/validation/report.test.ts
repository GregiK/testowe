import { describe, it, expect } from "vitest";
import { reportSchema } from "./report";

describe("reportSchema", () => {
  it("akceptuje poprawne zgłoszenie", () => {
    expect(
      reportSchema.safeParse({ targetUserId: "usr_1", reason: "Nieodpowiednie zdjęcia" }).success,
    ).toBe(true);
  });

  it("odrzuca zbyt krótki powód", () => {
    expect(reportSchema.safeParse({ targetUserId: "usr_1", reason: "zła" }).success).toBe(false);
  });

  it("odrzuca powód dłuższy niż 500 znaków", () => {
    expect(
      reportSchema.safeParse({ targetUserId: "usr_1", reason: "a".repeat(501) }).success,
    ).toBe(false);
  });
});
