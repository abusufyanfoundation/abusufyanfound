"use client";

import { useState } from "react";
import { submitBookRequest } from "@/app/(site)/apply/actions";
import { useActionForm } from "@/lib/forms/use-action-form";
import {
  ApplicantTypeFieldset,
  type ApplicantType,
} from "./ApplicantTypeFieldset";
import { Field } from "./Field";
import { Notice } from "./Notice";
import { SubmitButton } from "./SubmitButton";

const control =
  "border border-rule bg-white px-3.5 py-3 text-base text-ink transition-colors focus:border-navy";

export function BookRequestForm() {
  const { state, pending, onSubmit } = useActionForm(submitBookRequest);
  const [type, setType] = useState<ApplicantType>("student");

  const school = type === "school";
  const organisation = type !== "student";

  return (
    <form onSubmit={onSubmit} className="relative flex flex-col gap-6">
      <Notice error={state?.error} />

      <ApplicantTypeFieldset
        value={type}
        onChange={setType}
        schoolLimit="Schools can request up to 50 copies of a book, for example one for each student in a class."
      />

      {organisation && (
        <Field
          key={`org-${type}`}
          label={
            type === "mosque" ? "Name of the mosque" : "Name of the school"
          }
          name="organisationName"
        />
      )}

      <Field
        label={organisation ? "Contact person's full name" : "Your full name"}
        name="requesterName"
        autoComplete="name"
      />
      <Field label="Phone number" name="phone" type="tel" autoComplete="tel" />
      <Field
        label="Email address (optional)"
        name="email"
        type="email"
        autoComplete="email"
        required={false}
      />

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex-1">
          <Field label="State" name="state" autoComplete="address-level1" />
        </div>
        <div className="flex-1">
          <Field
            label="City or town"
            name="city"
            autoComplete="address-level2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="address" className="text-sm font-medium text-ink">
          {organisation ? "Address of the mosque or school" : "Your address"}
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          required
          className={control}
        />
      </div>

      <div className="flex flex-col gap-6 border-t border-rule pt-6">
        <Field label="Title of the book" name="bookTitle" />
        <Field label="Author" name="bookAuthor" required />

        {school && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="quantity" className="text-sm font-medium text-ink">
              Number of copies
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={50}
              step={1}
              defaultValue={10}
              required
              className={`${control} w-32`}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reason" className="text-sm font-medium text-ink">
            Why do you need this book?
          </label>
          <textarea id="reason" name="reason" rows={3} className={control} required/>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col items-start gap-3 pt-1">
        <SubmitButton pending={pending} pendingText="Sending…">
          Send request
        </SubmitButton>
        <p className="text-xs text-muted">
          The Foundation reviews every request. Sending one does not guarantee
          that the book will be supplied.
        </p>
      </div>
    </form>
  );
}
