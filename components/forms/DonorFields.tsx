import Link from "next/link";
import { Toggle } from "@/components/ui/Toggle";
import { Field } from "./Field";

export function DonorFields() {
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
      <Field
        label="Phone number (optional)"
        name="donorPhone"
        type="tel"
        autoComplete="tel"
        required={false}
      />

      <Toggle
        label="Display my name publicly"
        name="displayPublicly"
        hint="If you leave this off, you will appear as “Anonymous Supporter”."
      />

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
