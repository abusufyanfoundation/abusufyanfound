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

export const batchSchema = z.object({
  title: z.string().trim().min(3, "Please enter a title").max(150),
  description: z.string().trim().max(3000).optional(),
  campaignId: z.uuid({ error: "Please choose a campaign" }).optional(),
  maxCopies: z
    .number({ error: "Please enter the copies allowed per applicant" })
    .int("Please enter a whole number")
    .min(1, "Allow at least 1 copy per applicant")
    .max(100, "That is too many copies per applicant"),
  opensOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid opening date")
    .optional(),
  closesOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid closing date")
    .optional(),
});

export const batchBookSchema = z.object({
  title: z.string().trim().min(2, "Please enter a title").max(200),
  author: z.string().trim().max(200).optional(),
  copies: z
    .number({ error: "Please enter the number of copies" })
    .int("Please enter a whole number")
    .min(1, "Enter at least 1 copy")
    .max(100000, "That is too many copies"),
});