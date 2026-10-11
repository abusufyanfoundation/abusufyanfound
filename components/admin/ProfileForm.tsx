"use client";

import { useRef } from "react";
import { saveProfile } from "@/app/admin/(protected)/profile/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { useEditMode } from "@/lib/forms/use-edit-mode";
import { TextField } from "./forms/fields";

export function ProfileForm({
  fullName,
  email,
}: {
  fullName: string | null;
  email: string;
}) {
  const { state, pending, onSubmit } = useActionForm(saveProfile);
  const { editing, start, cancel } = useEditMode(state);
  const formRef = useRef<HTMLFormElement>(null);

  const locked = !editing;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex max-w-xl flex-col gap-6"
    >
      <FormMessage
        error={locked ? undefined : state?.error}
        message={locked ? state?.message : undefined}
      />

      <fieldset
        disabled={locked}
        className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0"
      >
        <TextField
          label="Full name"
          name="fullName"
          defaultValue={fullName ?? ""}
          autoComplete="name"
          hint="Shown in the sidebar and in the activity log."
        />
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Email address</span>
        <p className="text-base text-ink">{email}</p>
        <p className="text-xs text-muted">
          This is what you sign in with and it cannot be changed here.
        </p>
      </div>

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
              Save profile
            </SubmitButton>
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
          </>
        )}
      </div>
    </form>
  );
}
