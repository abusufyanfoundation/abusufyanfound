import { z } from "zod";

const donor = {
  donorName: z.string().trim().min(2, "Please enter your name").max(120),
  donorEmail: z.string().trim().email("Please enter a valid email address"),
  donorPhone: z.string().trim().max(20).optional(),
  displayPublicly: z.boolean().default(false),
};

export const generalDonationSchema = z.object({
  ...donor,
  amountNaira: z
    .number({ error: "Please enter an amount" })
    .min(100, "The minimum donation is ₦100")
    .max(100_000_000),
});

export const bookOrderSchema = z.object({
  ...donor,
  items: z
    .array(
      z.object({
        bookId: z.string().uuid(),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1, "Please select at least one book"),
});

export type GeneralDonationInput = z.infer<typeof generalDonationSchema>;
export type BookOrderInput = z.infer<typeof bookOrderSchema>;
