import { describe, it, expect } from "vitest";
import { messageSchema } from "./message";

describe("messageSchema", () => {
  it("akceptuje niepustą wiadomość", () => {
    expect(messageSchema.safeParse({ body: "Cześć!" }).success).toBe(true);
  });

  it("odrzuca pustą wiadomość (także same spacje)", () => {
    expect(messageSchema.safeParse({ body: "" }).success).toBe(false);
    expect(messageSchema.safeParse({ body: "   " }).success).toBe(false);
  });

  it("odrzuca wiadomość dłuższą niż 2000 znaków", () => {
    expect(messageSchema.safeParse({ body: "a".repeat(2001) }).success).toBe(false);
  });

  it("przycina białe znaki na brzegach", () => {
    const result = messageSchema.safeParse({ body: "  Cześć!  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe("Cześć!");
    }
  });
});
