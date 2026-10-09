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

      <label className="flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name="displayPublicly"
          className="mt-1 h-4 w-4 accent-navy"
        />
        <span>
          Display my name publicly
          <span className="mt-0.5 block text-xs text-muted">
            If you leave this unticked, you will appear as &ldquo;Anonymous
            Supporter&rdquo;.
          </span>
        </span>
      </label>
    </>
  );
}
