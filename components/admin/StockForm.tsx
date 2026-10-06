"use client";

import { useEffect, useRef } from "react";
import { adjustStock } from "@/app/admin/(protected)/books/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { TextField } from "./forms/fields";

export function StockForm({ bookId }: { bookId: string }) {
  const { state, pending, onSubmit } = useActionForm(adjustStock);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful change so it is not submitted twice
  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex max-w-md flex-col gap-5"
    >
      <FormMessage error={state?.error} message={state?.message} />
      <input type="hidden" name="bookId" value={bookId} />

      <TextField
        label="Change in copies"
        name="delta"
        type="number"
        step={1}
        hint="Use a positive number to add copies (for example 10) or a negative number to remove them (for example -2)."
      />
      <TextField
        label="Note (optional)"
        name="note"
        required={false}
        hint="For example: new stock bought, or damaged copies removed."
      />

      <div>
        <SubmitButton pending={pending} pendingText="Updating…">
          Update stock
        </SubmitButton>
      </div>
    </form>
  );
}
