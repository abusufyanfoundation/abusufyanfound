"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/admin/forgot-password/actions";
import { AuthField } from "./AuthField";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { BackLink } from "@/components/ui/BackLink";

export function ForgotPasswordForm({ expired }: { expired?: boolean }) {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      {expired && !state && (
        <FormMessage error="That link has expired or was already used. Please request a new one." />
      )}
      <FormMessage error={state?.error} message={state?.message} />

      <AuthField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
      />

      <div className="flex items-center justify-between pt-1">
        <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
        <BackLink href="/admin/login">Back to sign in</BackLink>
      </div>
    </form>
  );
}
