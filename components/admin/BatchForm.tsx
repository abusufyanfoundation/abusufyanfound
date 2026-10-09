"use client";

import { useRef } from "react";
import { saveBatch } from "@/app/admin/(protected)/batches/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { useEditMode } from "@/lib/forms/use-edit-mode";
import { SelectField, TextArea, TextField } from "./forms/fields";

export type BatchFormValues = {
  id: string;
  campaignTitle: string;
  title: string;
  description: string | null;
  maxCopies: number;
  opensOn: string;
  closesOn: string;
};

export function BatchForm({
  batch,
  campaigns = [],
}: {
  batch?: BatchFormValues;
  campaigns?: { value: string; label: string }[];
}) {
  const { state, pending, onSubmit } = useActionForm(saveBatch);
  const { editing, start, cancel } = useEditMode(state);
  const formRef = useRef<HTMLFormElement>(null);

  // An existing batch stays locked until "Edit details" is pressed
  const locked = Boolean(batch) && !editing;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex max-w-2xl flex-col gap-6"
    >
      <FormMessage
        error={locked ? undefined : state?.error}
        message={locked ? state?.message : undefined}
      />

      <fieldset
        disabled={locked}
        className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0"
      >
        {batch ? (
          <>
            <input type="hidden" name="id" value={batch.id} />
            <p className="text-sm text-muted">
              Campaign: <span className="text-ink">{batch.campaignTitle}</span>
            </p>
          </>
        ) : (
          <SelectField
            label="Campaign"
            name="campaignId"
            options={campaigns}
            hint="The books in this batch are bought with this campaign's funds."
          />
        )}

        <TextField label="Title" name="title" defaultValue={batch?.title} />

        <TextArea
          label="Description"
          name="description"
          defaultValue={batch?.description ?? ""}
          hint="Shown to applicants on the Apply for Books page."
        />

        <TextField
          label="Copies allowed per applicant (per book)"
          name="maxCopies"
          type="number"
          min={1}
          step={1}
          defaultValue={batch?.maxCopies ?? 5}
        />

        <TextField
          label="Applications open on"
          name="opensOn"
          type="date"
          required={false}
          defaultValue={batch?.opensOn ?? ""}
        />

        <TextField
          label="Applications close on"
          name="closesOn"
          type="date"
          required={false}
          defaultValue={batch?.closesOn ?? ""}
          hint="Leave both dates empty to control this by opening and closing the batch yourself."
        />
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        {locked ? (
          <button
            type="button"
            onClick={start}
            className="border border-navy px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Edit details
          </button>
        ) : (
          <>
            <SubmitButton pending={pending} pendingText="Saving…">
              Save batch
            </SubmitButton>
            {batch && (
              <button
                type="button"
                onClick={() => {
                  formRef.current?.reset();
                  cancel();
                }}
                className="text-sm text-muted underline underline-offset-4 hover:text-navy"
              >
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </form>
  );
}
