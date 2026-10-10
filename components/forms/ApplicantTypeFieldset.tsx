export type ApplicantType = "student" | "mosque" | "school";

const OPTIONS: { value: ApplicantType; label: string }[] = [
  { value: "student", label: "Individual" },
  { value: "mosque", label: "Mosque" },
  { value: "school", label: "School" },
];

export function ApplicantTypeFieldset({
  value,
  onChange,
  schoolLimit,
}: {
  value: ApplicantType;
  onChange: (value: ApplicantType) => void;
  schoolLimit: string;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-ink mb-2">
        Who is applying?
      </legend>

      <div className="flex flex-wrap gap-3">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-center gap-2 border px-4 py-2.5 text-sm transition-colors ${
              value === o.value
                ? "border-navy bg-navy text-white"
                : "border-rule bg-white text-navy hover:border-navy"
            }`}
          >
            <input
              type="radio"
              name="applicantType"
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>

      <p className="text-xs text-muted">
        {value === "school"
          ? schoolLimit
          : "Individuals and mosques can request a maximum of 1 copy of a book."}
      </p>
    </fieldset>
  );
}
