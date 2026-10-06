// Every payment reference for this project starts with this prefix.
// The shared webhook uses it to tell our payments from the other project's.
export const REFERENCE_PREFIX = "ASAF-";
export const PROJECT_ID = "alalmaiyy-foundation";

export const newReference = () =>
  `${REFERENCE_PREFIX}${crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 20)
    .toUpperCase()}`;

export const isOurReference = (reference: string) =>
  reference.startsWith(REFERENCE_PREFIX) && /^[A-Z0-9-]{6,64}$/.test(reference);
