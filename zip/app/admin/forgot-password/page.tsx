import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/admin/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Forgot your password?"
      intro="Enter the email address on your administrator account and we will send you a link to choose a new password."
    >
      <ForgotPasswordForm expired={error === "expired"} />
    </AuthShell>
  );
}
