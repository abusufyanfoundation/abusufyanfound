import { formatDateTime } from "@/lib/format";

export const consentText = (at: string | null, version: string | null) =>
  at
    ? `${formatDateTime(at)} · privacy notice ${version ?? "version not recorded"}`
    : "Not recorded (submitted before this was tracked)";
