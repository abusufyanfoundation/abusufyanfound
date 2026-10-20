"use client";

import { useState } from "react";
import { formatNaira } from "@/lib/money";

const button =
  "border border-navy px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";
const link = "py-3 text-sm text-muted underline underline-offset-4";

export function RaisedAmountForm({
  action,
  id,
  currentKobo,
  paidKobo,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  currentKobo: number;
  paidKobo: number;
  label: string;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [value, setValue] = useState(String(currentKobo / 100));

  const nextKobo = Math.round(Number(value) * 100);
  const filled =
    value.trim() !== "" && Number.isFinite(nextKobo) && nextKobo >= 0;
  const tooLow = filled && nextKobo < paidKobo;
  const change = nextKobo - currentKobo;
  const ready = filled && !tooLow && change !== 0;

  function reset() {
    setValue(String(currentKobo / 100));
    setEditing(false);
    setConfirming(false);
  }

  return (
    <form action={action} className="mt-5 flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />

      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        {label}
        <input
          name="raisedNaira"
          type="number"
          min={0}
          step="any"
          required
          value={value}
          disabled={!editing}
          onChange={(e) => {
            setValue(e.target.value);
            setConfirming(false);
          }}
          className="w-full max-w-xs border border-rule bg-white px-3.5 py-3 text-base text-ink focus:border-navy disabled:bg-paper disabled:text-muted"
        />
      </label>

      {editing && tooLow && (
        <p role="alert" className="text-sm text-red-800">
          The total cannot be less than the {formatNaira(paidKobo)} already paid
          through the website.
        </p>
      )}

      {confirming && ready && (
        <p className="max-w-md border-l-2 border-gold pl-4 text-sm leading-relaxed text-ink">
          Change the total from {formatNaira(currentKobo)} to{" "}
          {formatNaira(nextKobo)} ({change > 0 ? "+" : "-"}
          {formatNaira(Math.abs(change))}). The website will show the new figure
          straight away.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={button}
          >
            Edit amount
          </button>
        )}

        {editing && !confirming && (
          <>
            <button
              type="button"
              disabled={!ready}
              onClick={() => setConfirming(true)}
              className={`${button} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Review change
            </button>
            <button type="button" onClick={reset} className={link}>
              Cancel
            </button>
          </>
        )}

        {editing && confirming && (
          <>
            <button type="submit" className={button}>
              Confirm and save
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={link}
            >
              Back
            </button>
            <button type="button" onClick={reset} className={link}>
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
}
