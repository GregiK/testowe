import { describe, it, expect } from "vitest";
import { swipeSchema } from "./swipe";

describe("swipeSchema", () => {
  it("akceptuje poprawne akcje", () => {
    for (const action of ["LIKE", "PASS", "SUPERLIKE"]) {
      expect(swipeSchema.safeParse({ targetUserId: "usr_1", action }).success).toBe(true);
    }
  });

  it("odrzuca nieznaną akcję", () => {
    expect(swipeSchema.safeParse({ targetUserId: "usr_1", action: "SUPER_MEGA_LIKE" }).success).toBe(
      false,
    );
  });

  it("odrzuca pusty targetUserId", () => {
    expect(swipeSchema.safeParse({ targetUserId: "", action: "LIKE" }).success).toBe(false);
  });
});
