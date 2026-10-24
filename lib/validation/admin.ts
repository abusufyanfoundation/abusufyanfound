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
  campaignType: z.enum(["normal", "batch"]),
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
  targetNaira: money("a target amount"),
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

export const batchLocationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter a name for the location")
    .max(150),
  address: z
    .string()
    .trim()
    .min(3, "Please enter the address or directions")
    .max(300),
});

const httpsLink = z
  .string()
  .trim()
  .max(300, "That link is too long")
  .optional()
  .refine(
    (v) => !v || /^https:\/\/\S+$/i.test(v),
    "Links must start with https://",
  );

export const siteSettingsSchema = z
  .object({
    siteName: z
      .string({ error: "Please enter the site name" })
      .trim()
      .min(2, "The site name is too short")
      .max(120, "The site name can be up to 120 characters"),
    siteDescription: z
      .string({ error: "Please enter the site description" })
      .trim()
      .min(10, "The description is too short")
      .max(400, "The description can be up to 400 characters"),
    schoolRequestMaxCopies: z
      .number({ error: "Please enter the school copy limit" })
      .int("Please enter a whole number of copies")
      .min(1, "The limit must be at least 1")
      .max(50, "The limit cannot be more than 50"),
    contactEmail: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .optional(),
    contactPhone: z
      .string()
      .trim()
      .max(300, "That is too many phone numbers")
      .optional()
      .refine((v) => {
        if (!v) return true;
        const lines = v.split("\n");
        return (
          lines.length <= 5 &&
          lines.every((l) => l.length <= 30 && /\d/.test(l))
        );
      }, "Enter up to 5 phone numbers, one per line"),
    contactAddress: z
      .string()
      .trim()
      .max(200, "That address is too long")
      .optional(),
    facebookUrl: httpsLink,
    whatsappUrl: httpsLink,
    instagramUrl: httpsLink,
    youtubeUrl: httpsLink,
    announcementEnabled: z.boolean(),
    announcementText: z
      .string()
      .trim()
      .max(200, "The announcement can be up to 200 characters")
      .optional(),
    announcementLinkLabel: z
      .string()
      .trim()
      .max(40, "The link label can be up to 40 characters")
      .optional(),
    announcementLinkHref: z
      .string()
      .trim()
      .max(300, "That link is too long")
      .optional()
      .refine(
        (v) => !v || /^(https:\/\/\S+|\/(?!\/)\S*)$/.test(v),
        "The announcement link must start with https:// or /",
      ),
    donationsPaused: z.boolean(),
    donationsPausedMessage: z
      .string()
      .trim()
      .max(300, "The message can be up to 300 characters")
      .optional(),
    applicationsPaused: z.boolean(),
    applicationsPausedMessage: z
      .string()
      .trim()
      .max(300, "The message can be up to 300 characters")
      .optional(),
    minDonationNaira: z
      .number({ error: "Please enter the minimum donation" })
      .int("Please enter a whole number of naira")
      .min(100, "The minimum cannot be lower than ₦100")
      .max(1_000_000, "That minimum is too high"),
    bankName: z.string().trim().max(80, "The bank name is too long").optional(),
    bankAccountNumber: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || /^\d{10}$/.test(v),
        "An account number has 10 digits",
      ),
    bankAccountName: z
      .string()
      .trim()
      .max(120, "The account name is too long")
      .optional(),
    bookBankName: z
      .string()
      .trim()
      .max(80, "The bank name is too long")
      .optional(),
    bookBankAccountNumber: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || /^\d{10}$/.test(v),
        "An account number has 10 digits",
      ),
    bookBankAccountName: z
      .string()
      .trim()
      .max(120, "The account name is too long")
      .optional(),
    campaignOnlineEnabled: z.boolean(),
    campaignTransferEnabled: z.boolean(),
    booksOnlineEnabled: z.boolean(),
    booksTransferEnabled: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const bankComplete = (b?: string, n?: string, a?: string) =>
      Boolean(b) && Boolean(n) && Boolean(a);

    if (
      v.campaignTransferEnabled &&
      !bankComplete(v.bankName, v.bankAccountNumber, v.bankAccountName)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["bankAccountNumber"],
        message:
          "Fill in the Foundation bank name, account number and account name, or switch campaign transfers off.",
      });
    }
    if (
      v.booksTransferEnabled &&
      !bankComplete(
        v.bookBankName,
        v.bookBankAccountNumber,
        v.bookBankAccountName,
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["bookBankAccountNumber"],
        message:
          "Fill in the book pre-fund bank name, account number and account name, or switch book transfers off.",
      });
    }
    if (!v.campaignOnlineEnabled && !v.campaignTransferEnabled) {
      ctx.addIssue({
        code: "custom",
        path: ["campaignOnlineEnabled"],
        message:
          "Keep at least one way to give to campaigns on. To stop giving, use Pause donations.",
      });
    }
    if (!v.booksOnlineEnabled && !v.booksTransferEnabled) {
      ctx.addIssue({
        code: "custom",
        path: ["booksOnlineEnabled"],
        message:
          "Keep at least one way to pay for books on. To stop giving, use Pause donations.",
      });
    }
    if (v.announcementEnabled && !v.announcementText) {
      ctx.addIssue({
        code: "custom",
        path: ["announcementText"],
        message: "Enter the announcement text, or switch the banner off.",
      });
    }
    if (Boolean(v.announcementLinkLabel) !== Boolean(v.announcementLinkHref)) {
      ctx.addIssue({
        code: "custom",
        path: ["announcementLinkHref"],
        message:
          "Give the announcement link both a label and an address, or leave both blank.",
      });
    }
  });

export const campaignRaisedSchema = z.object({
  raisedNaira: z
    .number({ error: "Please enter the amount raised" })
    .min(0, "The amount cannot be negative")
    .max(100_000_000_000, "That amount is too high"),
});
