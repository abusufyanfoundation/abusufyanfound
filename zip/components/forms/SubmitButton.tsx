"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText,
  pending,
}: {
  children: React.ReactNode;
  pendingText: string;
  pending?: boolean;
}) {
  const status = useFormStatus();
  const isPending = pending ?? status.pending;

  return (
    <button
      type="submit"
      disabled={isPending}
      className="rounded-sm bg-navy px-6 py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? pendingText : children}
    </button>
  );
}
