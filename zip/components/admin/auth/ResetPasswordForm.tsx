"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/admin/reset-password/actions";
import { AuthField } from "./AuthField";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormMessage error={state?.error} />

      <AuthField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 10 characters."
      />
      <AuthField
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
      />

      <div className="pt-1">
        <SubmitButton pendingText="Saving…">Save new password</SubmitButton>
      </div>
    </form>
  );
}
