import { z } from "zod";

// Accepts 0816 475 8649, +234 816 475 8649 and 2348164758649, and stores +2348164758649
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (/^\+234\d{10}$/.test(digits)) return digits;
  if (/^234\d{10}$/.test(digits)) return `+${digits}`;
  if (/^0\d{10}$/.test(digits)) return `+234${digits.slice(1)}`;
  return null;
}

const phone = z
  .string()
  .trim()
  .refine(
    (v) => normalisePhone(v) !== null,
    "Please enter a valid Nigerian phone number, for example 0816 475 8649",
  )
  .transform((v) => normalisePhone(v) as string);

const required = (what: string, min = 2, max = 200) =>
  z.string().trim().min(min, `Please enter ${what}`).max(max);

const applicantType = z.enum(["student", "mosque", "school"], {
  error: "Please choose who is applying",
});

const contact = {
  applicantType,
  organisationName: z.string().trim().max(200).optional(),
  phone,
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .optional(),
  state: required("your state", 2, 80),
  city: required("your city or town", 2, 80),
  address: required("your address", 5, 300),
};

const needsOrganisation = (
  v: { applicantType: string; organisationName?: string },
  ctx: z.RefinementCtx,
) => {
  if (v.applicantType !== "student" && !v.organisationName) {
    ctx.addIssue({
      code: "custom",
      path: ["organisationName"],
      message:
        v.applicantType === "mosque"
          ? "Please enter the name of the mosque"
          : "Please enter the name of the school",
    });
  }
};

export const applicationSchema = z
  .object({
    batchId: z.string().uuid(),
    ...contact,
    applicantName: required("your full name", 2, 120),
    verifierName: required("your reference person's name", 2, 120),
    verifierPhone: phone,
    fulfilmentMethod: z.enum(["pickup", "delivery"], {
      error: "Please choose how you will receive the books",
    }),
    locationId: z.string().uuid().optional(),
    items: z
      .array(
        z.object({
          batchBookId: z.string().uuid(),
          quantity: z.number().int().min(1).max(100),
        }),
      )
      .min(1, "Please choose at least one book"),
  })
  .superRefine(needsOrganisation)
  .superRefine((v, ctx) => {
    if (v.fulfilmentMethod === "delivery" && v.applicantType === "student") {
      ctx.addIssue({
        code: "custom",
        path: ["fulfilmentMethod"],
        message: "Students collect their books in person",
      });
    }
    if (v.fulfilmentMethod === "pickup" && !v.locationId) {
      ctx.addIssue({
        code: "custom",
        path: ["locationId"],
        message: "Please choose where you will collect your books",
      });
    }
  });

export const bookRequestSchema = z
  .object({
    ...contact,
    requesterName: required("your full name", 2, 120),
    bookTitle: required("the book's title"),
    bookAuthor: z.string().trim().max(200).optional(),
    quantity: z
      .number({ error: "Please enter how many copies you need" })
      .int("Please enter a whole number")
      .min(1, "Please enter how many copies you need")
      .max(50, "Schools can request up to 50 copies"),
    reason: z.string().trim().max(1000).optional(),
  })
  .superRefine(needsOrganisation)
  .superRefine((v, ctx) => {
    if (v.applicantType !== "school" && v.quantity > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Students and mosques can request 1 copy",
      });
    }
  });
