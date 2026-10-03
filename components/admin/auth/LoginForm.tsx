"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/app/admin/login/actions";
import { AuthField } from "./AuthField";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function LoginForm() {
  const [state, action] = useActionState(signIn, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormMessage error={state?.error} />

      <AuthField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between pt-1">
        <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
        <Link
          href="/admin/forgot-password"
          className="text-sm text-navy underline underline-offset-4 decoration-gold hover:decoration-navy"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
