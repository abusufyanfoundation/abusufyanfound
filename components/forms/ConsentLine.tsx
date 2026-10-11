import Link from "next/link";

export function ConsentLine({
  subject,
  reference = false,
}: {
  subject: "application" | "request";
  reference?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 border-t border-rule pt-6 text-sm text-ink">
      <input
        type="checkbox"
        name="consent"
        required
        className="mt-1 h-4 w-4 accent-navy"
      />
      <span>
        I have read the{" "}
        <Link
          href="/privacy"
          target="_blank"
          className="text-navy underline decoration-gold underline-offset-4"
        >
          privacy notice
        </Link>{" "}
        and agree to the Foundation using my details to handle this {subject}. I
        am 18 or over, or a parent or guardian is applying or has agreed.
        {reference &&
          " I have told my reference person that I gave their details."}
      </span>
    </label>
  );
}
