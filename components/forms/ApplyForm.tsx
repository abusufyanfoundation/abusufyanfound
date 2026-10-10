"use client";

import { useState } from "react";
import { submitApplication } from "@/app/(site)/apply/actions";
import { useActionForm } from "@/lib/forms/use-action-form";
import {
  ApplicantTypeFieldset,
  type ApplicantType,
} from "./ApplicantTypeFieldset";
import { Field } from "./Field";
import { Notice } from "./Notice";
import { SubmitButton } from "./SubmitButton";

type Props = {
  batchId: string;
  maxCopies: number;
  books: { id: string; title: string; author: string | null }[];
  locations: { id: string; name: string; address: string }[];
};

const control =
  "border border-rule bg-white px-3.5 py-3 text-base text-ink transition-colors focus:border-navy";

const choice =
  "flex cursor-pointer items-start gap-3 border border-rule bg-white p-4 text-sm";

export function ApplyForm({ batchId, maxCopies, books, locations }: Props) {
  const { state, pending, onSubmit } = useActionForm(submitApplication);
  const [type, setType] = useState<ApplicantType>("individual");
  const [wantsDelivery, setWantsDelivery] = useState<boolean | null>(null);

  const student = type === "individual";
  const school = type === "school";
  const organisation = !student;

  // Students always collect. Mosques and schools choose.
  const method: "pickup" | "delivery" | "" = student
    ? "pickup"
    : wantsDelivery === null
      ? ""
      : wantsDelivery
        ? "delivery"
        : "pickup";

  return (
    <form onSubmit={onSubmit} className="relative flex flex-col gap-6">
      <Notice error={state?.error} />

      <input type="hidden" name="batchId" value={batchId} />
      <input type="hidden" name="fulfilmentMethod" value={method} />

      <ApplicantTypeFieldset
        value={type}
        onChange={setType}
        schoolLimit={`Schools can request up to ${maxCopies} copies of the book they choose, for example one for each student in a class.`}
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
        name="applicantName"
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

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-ink">
          Choose one book
        </legend>
        <p className="text-xs text-muted">
          You can apply for only one book in each batch.
        </p>

        <ul className="flex flex-col gap-3">
          {books.map((book) => (
            <li key={book.id}>
              <label className={choice}>
                <input
                  type="radio"
                  name="bookId"
                  value={book.id}
                  required
                  className="mt-1 h-4 w-4 accent-navy"
                />
                <span>
                  <span className="block font-display text-lg text-navy">
                    {book.title}
                  </span>
                  {book.author && (
                    <span className="block text-muted">{book.author}</span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>

        {school && (
          <div className="mt-2 flex flex-col gap-1.5">
            <label htmlFor="quantity" className="text-sm font-medium text-ink">
              How many copies of this book?
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxCopies}
              step={1}
              defaultValue={1}
              required
              className={`${control} w-32`}
            />
            <p className="text-xs text-muted">
              Up to {maxCopies}. For example, one for each student in a class.
            </p>
          </div>
        )}
      </fieldset>

      <div className="flex flex-col gap-6 border-t border-rule pt-6">
        <h3 className="font-display text-xl text-navy">Getting your books</h3>

        {organisation && (
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-ink">
              How would you like to receive the books?
            </legend>

            <label className={choice}>
              <input
                type="radio"
                name="receiveChoice"
                required
                checked={wantsDelivery === false}
                onChange={() => setWantsDelivery(false)}
                className="mt-1 h-4 w-4 accent-navy"
              />
              <span>
                <span className="block font-medium text-ink">
                  Collect from one of the locations
                </span>
                <span className="block text-muted">
                  Someone from your {type === "mosque" ? "mosque" : "school"}{" "}
                  will come and collect the books.
                </span>
              </span>
            </label>

            <label className={choice}>
              <input
                type="radio"
                name="receiveChoice"
                required
                checked={wantsDelivery === true}
                onChange={() => setWantsDelivery(true)}
                className="mt-1 h-4 w-4 accent-navy"
              />
              <span>
                <span className="block font-medium text-ink">
                  Please bring them to my{" "}
                  {type === "mosque" ? "mosque" : "school"}
                </span>
                <span className="block text-muted">
                  We will use the address you entered above. Delivery is not
                  guaranteed. The Foundation decides based on distance and the
                  number of copies.
                </span>
              </span>
            </label>
          </fieldset>
        )}

        {method === "pickup" && (
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-ink">
              {student
                ? "Where will you collect your book?"
                : "Collection location"}
            </legend>
            <p className="text-xs text-muted">
              {student
                ? "Books are collected in person from one of these locations. By choosing one, you confirm that you will come there to collect your book."
                : "Choose the location you will collect from."}
            </p>

            <ul className="flex flex-col gap-3">
              {locations.map((l) => (
                <li key={l.id}>
                  <label className={choice}>
                    <input
                      type="radio"
                      name="locationId"
                      value={l.id}
                      required
                      className="mt-1 h-4 w-4 accent-navy"
                    />
                    <span>
                      <span className="block font-medium text-ink">
                        {l.name}
                      </span>
                      <span className="block text-muted">{l.address}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}
      </div>

      <div className="flex flex-col gap-6 border-t border-rule pt-6">
        <h3 className="font-display text-xl text-navy">Verification</h3>

        {student ? (
          <p className="text-sm text-ink">
            We may call you on the phone number you gave to confirm your
            application.
          </p>
        ) : (
          <>
            <p className="text-sm text-ink">
              We will contact you and your reference person to confirm this
              application.
            </p>

            <Field
              key={`vn-${type}`}
              label={
                type === "mosque"
                  ? "Reference person's name (the imam or a mosque official)"
                  : "Reference person's name (the mudeer, head of school or class teacher)"
              }
              name="verifierName"
            />
            <Field
              key={`vr-${type}`}
              label={
                type === "mosque"
                  ? "Their position or relationship to the mosque"
                  : "Their position or relationship to the school"
              }
              name="verifierRole"
              hint={
                type === "mosque"
                  ? "For example: Imam, Chairman, Secretary."
                  : "For example: Mudeer, Head teacher, Class teacher."
              }
            />
            <Field
              label="Their phone number"
              name="verifierPhone"
              type="tel"
              hint="This must be a different number from yours."
            />
          </>
        )}
      </div>

      {/* Hidden from people. Bots that fill it are ignored. */}
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
          Submit application
        </SubmitButton>
        <p className="text-xs text-muted">
          Applications are reviewed by the Foundation. Applying does not
          guarantee that you will receive the book. You can apply only once for
          each batch.
        </p>
      </div>
    </form>
  );
}
