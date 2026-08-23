import { z } from "zod";

export const reportSchema = z.object({
  targetUserId: z.string().min(1),
  reason: z.string().trim().min(5, "Podaj krótki powód zgłoszenia (min. 5 znaków).").max(500),
});

export type ReportInput = z.infer<typeof reportSchema>;
