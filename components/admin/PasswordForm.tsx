"use client";

import { useEffect, useRef } from "react";
import { changePassword } from "@/app/admin/(protected)/profile/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { TextField } from "./forms/fields";

export function PasswordForm() {
  const { state, pending, onSubmit } = useActionForm(changePassword);
  const formRef = useRef<HTMLFormElement>(null);

  // Passwords should not linger in the fields after a successful change
  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex max-w-xl flex-col gap-6"
    >
      <FormMessage error={state?.error} message={state?.message} />

      <TextField
        label="Current password"
        name="current"
        type="password"
        autoComplete="current-password"
      />
      <TextField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 10 characters."
      />
      <TextField
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
      />

      <div>
        <SubmitButton pending={pending} pendingText="Saving…">
          Change password
        </SubmitButton>
      </div>
    </form>
  );
}
