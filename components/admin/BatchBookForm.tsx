"use client";

import { useEffect, useRef } from "react";
import { addBatchBook } from "@/app/admin/(protected)/batches/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { TextField } from "./forms/fields";

export function BatchBookForm({ batchId }: { batchId: string }) {
  const { state, pending, onSubmit } = useActionForm(addBatchBook);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful add, so the next book can be typed straight away
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

      <TextField label="Book title" name="bookTitle" />
      <TextField label="Author" name="bookAuthor" required={false} />
      <TextField
        label="Copies in this batch"
        name="copies"
        type="number"
        min={1}
        step={1}
      />

      <div>
        <SubmitButton pending={pending} pendingText="Adding…">
          Add book
        </SubmitButton>
      </div>
    </form>
  );
}
