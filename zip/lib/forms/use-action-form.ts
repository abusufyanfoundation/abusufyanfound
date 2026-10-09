"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "./types";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

// Runs a server action without React's automatic form reset,
// so people never lose what they typed when something goes wrong.
export function useActionForm(action: Action) {
  const [state, run, pending] = useActionState(action, undefined);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => run(data));
  };

  return { state, pending, onSubmit };
}
