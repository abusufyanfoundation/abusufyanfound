export function AuthField({
  label,
  name,
  type = "text",
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="border border-rule bg-white px-3.5 py-3 text-base text-ink transition-colors focus:border-navy"
      />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
