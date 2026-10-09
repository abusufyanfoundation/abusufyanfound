import { z } from "zod";

const money = (what: string) =>
  z
    .number({ error: `Please enter ${what}` })
    .positive(`Please enter ${what}`)
    .max(10_000_000_000, "That amount is too large");

export const campaignSchema = z.object({
  title: z.string().trim().min(3, "Please enter a title").max(150),
  description: z.string().trim().max(5000).optional(),
  targetNaira: money("a target amount"),
  isActive: z.boolean(),
});

export const bookSchema = z.object({
  title: z.string().trim().min(2, "Please enter a title").max(200),
  author: z.string().trim().min(2, "Please enter an author").max(200),
  description: z.string().trim().max(3000).optional(),
  priceNaira: money("a price"),
  status: z.enum(["draft", "listed", "hidden"]),
});
