const control =
  "w-full border border-rule bg-white px-3.5 py-3 text-base text-ink transition-colors focus:border-navy disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted";

function Shell({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  autoComplete,
  required = true,
  hint,
  min,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  min?: number;
  step?: number | "any";
}) {
  return (
    <Shell label={label} htmlFor={name} hint={hint}>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        min={min}
        step={step}
        className={control}
      />
    </Shell>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 5,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <Shell label={label} htmlFor={name} hint={hint}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className={control}
      />
    </Shell>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <Shell label={label} htmlFor={name} hint={hint}>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={control}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Shell>
  );
}

export { Toggle as ToggleField } from "@/components/ui/Toggle";

export function FileField({
  label,
  name,
  hint,
}: {
  label: string;
  name: string;
  hint?: string;
}) {
  return (
    <Shell label={label} htmlFor={name} hint={hint}>
      <input
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="text-sm text-ink disabled:opacity-60 file:mr-4 file:border file:border-navy file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy"
      />
    </Shell>
  );
}
