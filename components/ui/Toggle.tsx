export function Toggle({
  label,
  name,
  value,
  defaultChecked,
  hint,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  value?: string;
  defaultChecked?: boolean;
  hint?: string;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 text-sm text-ink ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0">
        <input
          type="checkbox"
          role="switch"
          name={name}
          value={value}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-sm bg-muted/40 transition-colors peer-checked:bg-navy peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold peer-disabled:opacity-60"
        />
        <span
          aria-hidden="true"
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-sm bg-white transition-transform peer-checked:translate-x-5 peer-disabled:opacity-80"
        />
      </span>
      <span className={disabled ? "opacity-60" : undefined}>
        {label}
        {hint && (
          <span className="mt-0.5 block text-xs text-muted">{hint}</span>
        )}
      </span>
    </label>
  );
}
