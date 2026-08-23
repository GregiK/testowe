import { z } from "zod";

export const messageSchema = z.object({
  body: z.string().trim().min(1, "Wiadomość nie może być pusta.").max(2000),
});

export type MessageInput = z.infer<typeof messageSchema>;
