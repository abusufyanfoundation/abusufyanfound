import Link from "next/link";
import { Field } from "./Field";

export function DonorFields({
  phoneRequired = false,
  askPhone = true,
}: {
  phoneRequired?: boolean;
  askPhone?: boolean;
}) {
  return (
    <>
      <Field label="Full name" name="donorName" autoComplete="name" />
      <Field
        label="Email address"
        name="donorEmail"
        type="email"
        autoComplete="email"
        hint="Needed to process your payment."
      />
      {askPhone && (
        <Field
          label={phoneRequired ? "Phone number" : "Phone number (optional)"}
          name="donorPhone"
          type="tel"
          autoComplete="tel"
          required={phoneRequired}
          hint={
            phoneRequired
              ? "So we can reach you if there is a problem with your transfer."
              : undefined
          }
        />
      )}

      <p className="text-xs text-muted">
        How we use your details is explained in our{" "}
        <Link
          href="/privacy"
          target="_blank"
          className="text-navy underline decoration-gold underline-offset-4"
        >
          privacy notice
        </Link>
        .
      </p>
    </>
  );
}
