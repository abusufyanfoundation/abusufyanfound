export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  hint,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  required?: boolean;
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
        required={required}
        className="border border-rule bg-white px-3.5 py-3 text-base text-ink transition-colors focus:border-navy"
      />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
