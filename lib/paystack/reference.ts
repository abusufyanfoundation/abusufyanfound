// Our own payment references start with this prefix, which makes them easy
// to recognise in the Paystack dashboard.
export const REFERENCE_PREFIX = "ASAF-";

export const newReference = () =>
  `${REFERENCE_PREFIX}${crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 20)
    .toUpperCase()}`;

// A basic sanity check before a reference from a URL or webhook is used
export const isValidReference = (reference: string) =>
  /^[A-Za-z0-9_-]{6,64}$/.test(reference);
