import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth/AuthShell";
import { ResetPasswordForm } from "@/components/admin/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      intro="Enter a new password for your administrator account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}