"use client";

import { useEffect, useRef } from "react";
import { addBatchLocation } from "@/app/admin/(protected)/batches/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { TextField } from "./forms/fields";

export function BatchLocationForm({ batchId }: { batchId: string }) {
  const { state, pending, onSubmit } = useActionForm(addBatchLocation);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex max-w-2xl flex-col gap-6"
    >
      <FormMessage error={state?.error} message={state?.message} />

      <input type="hidden" name="batchId" value={batchId} />

      <TextField
        label="Location name"
        name="locationName"
        hint="For example: Ikeja office, or Central Mosque, Ibadan."
      />
      <TextField
        label="Address or directions"
        name="locationAddress"
        hint="Include the days and times people can come, if you have them."
      />

      <div>
        <SubmitButton pending={pending} pendingText="Adding…">
          Add location
        </SubmitButton>
      </div>
    </form>
  );
}
