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
  const [type, setType] = useState<ApplicantType>("student");
  const [wantsDelivery, setWantsDelivery] = useState<boolean | null>(null);

  const student = type === "student";
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
        schoolLimit={`Schools can request up to ${maxCopies} copies of a book.`}
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
          Books you are applying for
        </legend>
        <p className="text-xs text-muted">
          {school
            ? `Enter how many copies of each book you need, up to ${maxCopies}. Leave a book at 0 if you do not need it.`
            : "Tick each book you need. You will receive 1 copy of each."}
        </p>

        <ul className="divide-y divide-rule border-y border-rule">
          {books.map((book) => (
            <li
              key={`${type}-${book.id}`}
              className="flex items-center justify-between gap-4 py-3"
            >
              <label htmlFor={`qty_${book.id}`} className="flex-1">
                <span className="font-display text-lg text-navy">
                  {book.title}
                </span>
                {book.author && (
                  <span className="block text-sm text-muted">
                    {book.author}
                  </span>
                )}
              </label>

              {school ? (
                <input
                  id={`qty_${book.id}`}
                  name={`qty_${book.id}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={maxCopies}
                  step={1}
                  defaultValue={0}
                  className="w-24 border border-rule bg-white px-3 py-2 text-base text-ink focus:border-navy"
                />
              ) : (
                <input
                  id={`qty_${book.id}`}
                  name={`qty_${book.id}`}
                  type="checkbox"
                  value="1"
                  className="h-5 w-5 accent-navy"
                />
              )}
            </li>
          ))}
        </ul>
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
                ? "Where will you collect your books?"
                : "Collection location"}
            </legend>
            <p className="text-xs text-muted">
              {student
                ? "Books are collected in person from one of these locations. By choosing one, you confirm that you will come there to collect your books."
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
        <p className="text-sm text-ink">
          Please give someone who can confirm your application, such as your
          teacher, imam or head of school. We may contact them.
        </p>
        <Field label="Reference person's name" name="verifierName" />
        <Field
          label="Reference person's phone number"
          name="verifierPhone"
          type="tel"
        />
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
          guarantee that you will receive the books.
        </p>
      </div>
    </form>
  );
}
