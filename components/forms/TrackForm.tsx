"use client";

import { startTransition, useActionState } from "react";
import { trackSubmission } from "@/app/(site)/apply/actions";
import type { TrackResult } from "@/lib/apply/types";
import { Field } from "./Field";
import { Notice } from "./Notice";
import { SubmitButton } from "./SubmitButton";

const STATUS: Record<string, { label: string; text: string }> = {
  pending: {
    label: "Received",
    text: "Your submission has been received and is waiting to be reviewed.",
  },
  approved: {
    label: "Approved",
    text: "Your submission has been approved. The Foundation will contact you about getting the books to you.",
  },
  rejected: {
    label: "Not approved",
    text: "Your submission was not approved this time. You are welcome to apply again for a future batch.",
  },
  fulfilled: {
    label: "Fulfilled",
    text: "The books have been handed over. May Allah reward you with benefit from them.",
  },
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "Africa/Lagos",
  }).format(new Date(iso));

function Result({ result }: { result: TrackResult }) {
  const status = STATUS[result.status] ?? STATUS.pending;

  return (
    <div className="border-l-2 border-gold pl-6">
      <p className="text-xs tracking-[0.18em] text-gold-deep uppercase">
        {status.label}
      </p>
      <p className="mt-3 font-display text-2xl text-navy">{result.reference}</p>
      <p className="mt-1 text-sm text-muted">
        Submitted {formatDate(result.submitted_at)}
      </p>
      <p className="mt-4 max-w-md leading-relaxed text-ink">{status.text}</p>

      {result.kind === "application" ? (
        <>
          <ul className="mt-5 divide-y divide-rule border-y border-rule">
            {result.items.map((item) => (
              <li
                key={item.title}
                className="flex justify-between gap-4 py-3 text-sm"
              >
                <span className="text-ink">{item.title}</span>
                <span className="text-muted">
                  {result.status === "approved" || result.status === "fulfilled"
                    ? `${item.approved} of ${item.requested} copies`
                    : `${item.requested} requested`}
                </span>
              </li>
            ))}
          </ul>

          {result.method === "pickup" && result.location && (
            <p className="mt-5 text-sm text-ink">
              <span className="font-medium">Collection location:</span>{" "}
              {result.location.name}, {result.location.address}
            </p>
          )}
          {result.method === "delivery" && (
            <p className="mt-5 text-sm text-ink">
              <span className="font-medium">Delivery requested.</span> The
              Foundation will confirm whether it can bring the books to you.
            </p>
          )}
        </>
      ) : (
        <p className="mt-5 text-sm text-ink">
          {result.quantity} × {result.book}
        </p>
      )}
    </div>
  );
}

export function TrackForm() {
  const [state, run, pending] = useActionState(trackSubmission, undefined);

  // Runs the action without React's automatic form reset, like the other forms
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => run(data));
  };

  return (
    <div className="flex flex-col gap-10">
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <Notice error={state?.error} />
        <Field
          label="Reference code"
          name="reference"
          hint="Enter the reference code you received after submitting. It starts with ASAF-"
        />
        <Field
          label="Phone number you used"
          name="phone"
          type="tel"
          autoComplete="tel"
        />
        <div>
          <SubmitButton pending={pending} pendingText="Checking…">
            Check status
          </SubmitButton>
        </div>
      </form>

      {state?.result && <Result result={state.result} />}
    </div>
  );
}
