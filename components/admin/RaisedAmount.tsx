"use client";

import { useState } from "react";

const button =
  "border border-navy px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";

export function RaisedAmountForm({
  action,
  id,
  defaultNaira,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  defaultNaira: number;
  label: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <form action={action} className="mt-5 flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={id} />
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        {label}
        <input
          name="raisedNaira"
          type="number"
          min={0}
          step="any"
          required
          defaultValue={defaultNaira}
          disabled={!editing}
          className="border border-rule bg-white px-3.5 py-3 text-base text-ink focus:border-navy disabled:bg-paper disabled:text-muted"
        />
      </label>

      {editing ? (
        <>
          <button type="submit" className={button}>
            Save amount
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.form?.reset();
              setEditing(false);
            }}
            className="py-3 text-sm text-muted underline underline-offset-4"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={button}
        >
          Edit amount
        </button>
      )}
    </form>
  );
}
