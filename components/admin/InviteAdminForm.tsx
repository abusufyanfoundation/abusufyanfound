"use client";

import { useEffect, useRef } from "react";
import { inviteAdmin } from "@/app/admin/(protected)/team/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { TextField } from "./forms/fields";

export function InviteAdminForm() {
  const { state, pending, onSubmit } = useActionForm(inviteAdmin);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form once an invitation is sent. It stays filled when something fails.
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

      <TextField label="Full name" name="fullName" autoComplete="off" />
      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="off"
        hint="They receive an email with a link to choose their password."
      />

      <div>
        <SubmitButton pending={pending} pendingText="Sending…">
          Send invitation
        </SubmitButton>
      </div>
    </form>
  );
}
