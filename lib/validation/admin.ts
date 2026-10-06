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
  status: z.enum(["draft", "available", "unavailable"]),
});

export const newBookSchema = bookSchema.extend({
  quantity: z
    .number({ error: "Please enter a quantity" })
    .int("The quantity must be a whole number")
    .min(0, "The quantity cannot be negative")
    .max(100000),
});

export const stockSchema = z.object({
  bookId: z.string().uuid(),
  delta: z
    .number({ error: "Please enter a number" })
    .int("Use a whole number")
    .refine((n) => n !== 0, "Enter a number other than zero")
    .refine((n) => Math.abs(n) <= 100000, "That number is too large"),
  note: z.string().trim().max(200).optional(),
});
